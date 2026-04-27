function CenteredNotice({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div className="center-notice-wrap">
      <div className={`center-notice ${type}`}>
        <span>{message}</span>
        <button onClick={onClose}>×</button>
      </div>
    </div>
  );
}

export default CenteredNotice;
