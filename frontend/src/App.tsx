import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import NotificationsPage from "./pages/NotificationsPage";
import OnboardingPage from "./pages/OnboardingPage";
import CallPage from "./pages/CallPage";
import ChatPage from "./pages/ChatPage";
import useAuthUser from "./hooks/useAuthUser";
import PageLoader from "./components/PageLoader";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";

function App() {

  const {isLoading,authUser}=useAuthUser();

  const isAuthenticated = !!authUser;
  const isOnboarded=authUser?.isonboarded


  if (isLoading) return <PageLoader/>


  return (
    <>
      <Routes>
        <Route path="/"  element={isAuthenticated && isOnboarded?(
          <HomePage/>
        ):(
          <Navigate to={!isAuthenticated?'/login':'onboarding'}/>
        )}
        />
        <Route
          path="/signup"
          element={
            isLoading ? (<div>Loading...</div>) : !isAuthenticated ? (
              <SignUpPage />
            ) :<Navigate to={isOnboarded?'/':'/onboarding'}/>
          }
        />
        <Route
          path="/login"
          element={
            isLoading ? (
              <div>Loading...</div>
            ) : !isAuthenticated ? (
              <LoginPage />
            ) : <Navigate to={isOnboarded?'/':'/onboarding'}/>
          }
        />
        <Route
        path="/auth/google/callback"
        element={<GoogleCallbackPage />}
        />
        <Route
          path="/onboarding"
          element={isAuthenticated?(
            !isOnboarded?(
              <OnboardingPage/>
            ):(
              <Navigate to="/"/>
            )
          ):(
            <Navigate to='/login'/>
          )}
        />
        <Route
          path="/notifications"
          element={
            isLoading ? (
              <div>Loading...</div>
            ) : isAuthenticated ? (
              <NotificationsPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/call"
          element={
            isLoading ? (
              <div>Loading...</div>
            ) : isAuthenticated ? (
              <CallPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/chat"
          element={
            isLoading ? (
              <div>Loading...</div>
            ) : isAuthenticated ? (
              <ChatPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;