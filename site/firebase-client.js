import {firebaseConfig} from './firebase-config.js';
import {geminiConfig} from './gemini-config.js?v=gemini-2';
import {TUTOR_INSTRUCTION} from './gemini-conversation.js';
import {enterpriseTokenProvider} from './app-attestation.js?v=gemini-5';
const SDK='https://www.gstatic.com/firebasejs/13.1.0/';
let clientPromise;
export function firebaseReady(){return !!(firebaseConfig?.apiKey&&firebaseConfig?.projectId&&firebaseConfig?.authDomain);}
export function getFirebaseClient(){
 if(!firebaseReady())return Promise.reject(new Error('Firebase setup is not complete yet. Please try again shortly.'));
 return clientPromise??=(async()=>{
  const [appSDK,authSDK,dbSDK]=await Promise.all([import(SDK+'firebase-app.js'),import(SDK+'firebase-auth.js'),import(SDK+'firebase-firestore.js')]);
  const app=appSDK.initializeApp(firebaseConfig),auth=authSDK.getAuth(app),db=dbSDK.getFirestore(app),provider=new authSDK.GoogleAuthProvider();
  let tutorPromise,appCheck;
  provider.setCustomParameters({prompt:'select_account'});
  return {
   currentUser:()=>auth.currentUser,
   observe:(next,error)=>authSDK.onAuthStateChanged(auth,next,error),
   signIn:()=>authSDK.signInWithPopup(auth,provider),
   signOut:()=>authSDK.signOut(auth),
   async askGemini(contents){
    const uid=auth.currentUser?.uid;
    if(!uid)throw new Error('Sign in to ask Gemini.');
    const tutor=await (tutorPromise??=(async()=>{
     if(!geminiConfig.appCheckSiteKey)throw new Error('Gemini App Check setup is incomplete.');
     const [checkSDK,aiSDK]=await Promise.all([import(SDK+'firebase-app-check.js'),import(SDK+'firebase-ai.js')]);
     const attestationProvider=geminiConfig.appCheckProvider==='enterprise'?new checkSDK.CustomProvider({getToken:enterpriseTokenProvider(firebaseConfig,geminiConfig.appCheckSiteKey)}):new checkSDK.ReCaptchaV3Provider(geminiConfig.appCheckSiteKey);
     appCheck??=checkSDK.initializeAppCheck(app,{provider:attestationProvider,isTokenAutoRefreshEnabled:true});
     const ai=aiSDK.getAI(app,{backend:new aiSDK.GoogleAIBackend()});
     return {model:aiSDK.getGenerativeModel(ai,{model:geminiConfig.model,systemInstruction:TUTOR_INSTRUCTION,generationConfig:{maxOutputTokens:2048,temperature:0.4}},{timeout:45000}),verify:()=>checkSDK.getToken(appCheck)};
    })().catch(error=>{tutorPromise=null;throw error;}));
    await tutor.verify();
    if(auth.currentUser?.uid!==uid)throw new Error('Sign in to ask Gemini.');
    const result=await tutor.model.generateContent({contents});
    return result.response.text();
   },
   async saveProfile(user){
    if(!user.email)throw new Error('Google did not provide an email address. Choose another account.');
    const ref=dbSDK.doc(db,'users',user.uid),old=await dbSDK.getDoc(ref);
    const profile={uid:user.uid,email:user.email,name:(user.displayName||user.email.split('@')[0]).slice(0,200),lastLoginAt:dbSDK.serverTimestamp(),updatedAt:dbSDK.serverTimestamp()};
    if(!old.exists())profile.createdAt=dbSDK.serverTimestamp();
    await dbSDK.setDoc(ref,profile,{merge:true});
   },
   workspace(uid){
    const collection=dbSDK.collection(db,'users',uid,'workspace');
    return {
     subscribe:(next,error)=>dbSDK.onSnapshot(collection,{includeMetadataChanges:true},snapshot=>next({fromCache:snapshot.metadata.fromCache,pending:snapshot.metadata.hasPendingWrites,records:Object.fromEntries(snapshot.docs.map(d=>[d.id,d.data().data]))}),error),
     write:records=>{const batch=dbSDK.writeBatch(db);for(const record of records)batch.set(dbSDK.doc(collection,record.id),{data:record.data,updatedAt:dbSDK.serverTimestamp()});return batch.commit();}
    };
   }
  };
 })().catch(error=>{clientPromise=null;throw error;});
}
export function authErrorMessage(error){
 const messages={
  'auth/popup-blocked':'Your browser blocked Google sign-in. Allow popups for this site and try again.',
  'auth/popup-closed-by-user':'Sign-in was closed. Select Continue with Google to try again.',
  'auth/cancelled-popup-request':'Another sign-in window is open. Finish there or try again.',
  'auth/unauthorized-domain':'This website has not been authorized for Google sign-in yet. Please contact the site owner.',
  'auth/network-request-failed':'Google sign-in could not connect. Check your internet connection and retry.',
  'auth/operation-not-allowed':'Google sign-in has not been enabled for this app yet.',
  'permission-denied':'Your account could not access its workspace. Please retry or contact the site owner.',
  'unavailable':'Your cloud workspace is temporarily unavailable. Please reconnect and retry.'
 };
 return messages[error?.code]||error?.message||'Something interrupted sign-in. Please try again.';
}
