const LoadingState = ({ label = "Loading..." }) => (
  <div className="state-block">
    <div className="spinner" />
    <span>{label}</span>
  </div>
);

export default LoadingState;
