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
import FriendsPage from "./pages/FriendsPage";
import useAuthUser from "./hooks/useAuthUser";
import PageLoader from "./components/PageLoader";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";
import Layout from "./components/Layout";
import ThemeManager from "./components/ThemeManager";

function App() {

  const {isLoading,authUser}=useAuthUser();

  const isAuthenticated = !!authUser;
  const isOnboarded=authUser?.isonboarded


  if (isLoading) return <PageLoader/>


  return (
    <>
      <ThemeManager />
      <Routes>
        <Route path="/"  element={isAuthenticated && isOnboarded?(
          <Layout showSideBar={true}>
              <HomePage/>
          </Layout>
        ):(
          <Navigate to={!isAuthenticated?'/login':'onboarding'}/>
        )}
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignUpPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
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
          path="/friends"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSideBar={true}>
                <FriendsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSideBar={true}>
                        <NotificationsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated?"/login":"/onboarding" } />
            )
          }
        />
        <Route
          path="/call"
          element={
            isAuthenticated ? <CallPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/chat/:friendId?"
          element={
            isAuthenticated&& isOnboarded ? (
              <Layout showSideBar={false}>
                <ChatPage/>
              </Layout>
            ):(
              <Navigate to={!isAuthenticated?"/login":"/onboarding" } />
            )
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;