import { Suspense } from "react";
import LoginView from "../../components/views/LoginView";
import LoadingState from "../../components/LoadingState";

export const metadata = {
  title: "Log In",
  robots: { index: false, follow: false },
};

const LoginPage = () => (
  <Suspense fallback={<LoadingState />}>
    <LoginView />
  </Suspense>
);

export default LoginPage;
