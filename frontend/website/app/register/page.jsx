import { Suspense } from "react";
import RegisterView from "../../components/views/RegisterView";
import LoadingState from "../../components/LoadingState";

export const metadata = {
  title: "Create an Account",
  robots: { index: false, follow: false },
};

const RegisterPage = () => (
  <Suspense fallback={<LoadingState />}>
    <RegisterView />
  </Suspense>
);

export default RegisterPage;
