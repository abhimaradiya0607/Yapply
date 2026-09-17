import { Route, Routes } from "react-router";
import "./App.css";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import NotificationsPage from "./pages/NotificationsPage";
import OnboardingPage from "./pages/OnboardingPage";
import CallPage from "./pages/CallPage";
import ChatPage from "./pages/ChatPage";
import toast, { Toaster } from "react-hot-toast";


function App() {
   return (
  <>
  <Routes>
    <Route path="/" element={<HomePage/>}/>
    <Route path="/signup" element={<SignUpPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/onboarding" element={<OnboardingPage/>}/>
    <Route path="/notifications" element={<NotificationsPage/>}/>
    <Route path="/call" element={<CallPage/>}/>
    <Route path="/chat" element={<ChatPage/>}/>
  </Routes>
  <Toaster/> 
  </>
  );
}

export default App;