import ModalShell from './ModalShell';

const RejectOrderModal = ({ decId, reason, onReasonChange, decErr, onClose, onConfirm }) => {
  return (
    <ModalShell title={`Reject Order #${decId}`} onClose={onClose}>
      <div style={{ marginTop: 14 }}>
        <label className="field">Reason for rejecting
          <textarea rows={3} placeholder="e.g. Item out of stock for the chosen date"
            value={reason} onChange={onReasonChange}
            className={decErr ? 'bad' : ''} />
        </label>
        {decErr && <p className="er">{decErr}</p>}
      </div>
      <div className="form-actions">
        <button className="button secondary" onClick={onClose}>Cancel</button>
        <button className="button danger" onClick={onConfirm}>Confirm Reject</button>
      </div>
    </ModalShell>
  );
};

export default RejectOrderModal;