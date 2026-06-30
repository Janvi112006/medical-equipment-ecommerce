import RequireAuth from "../../components/RequireAuth";
import ProfileView from "../../components/views/ProfileView";

export const metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

const ProfilePage = () => (
  <RequireAuth>
    <ProfileView />
  </RequireAuth>
);

export default ProfilePage;
