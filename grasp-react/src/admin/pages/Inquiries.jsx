import { useState, useEffect } from 'react';
import { inquiryAPI } from '../../services';

const statusColors = {
  NEW: { bg: '#DBEAFE', text: '#1E40AF', label: 'New' },
  READ: { bg: '#FEF3C7', text: '#92400E', label: 'Read' },
  REPLIED: { bg: '#D1FAE5', text: '#065F46', label: 'Replied' },
  CLOSED: { bg: '#E5E7EB', text: '#374151', label: 'Closed' },
};

const typeLabels = {
  GENERAL: 'General',
  SUPPORT: 'Support',
  PARTNERSHIP: 'Partnership',
  OTHER: 'Other',
};

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(false);

  // Fetch inquiries
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await inquiryAPI.getAll();
      setInquiries(response.data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Filter inquiries
  const filteredInquiries = filter === 'all'
    ? inquiries
    : inquiries.filter(inq => inq.status === filter);

  // Update inquiry status
  const updateStatus = async (id, status) => {
    try {
      setUpdating(true);
      await inquiryAPI.update(id, { status });
      await fetchInquiries();
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(prev => ({ ...prev, status }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // Delete inquiry
  const deleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await inquiryAPI.delete(id);
      await fetchInquiries();
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('Failed to delete inquiry');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner" />
        <p>Loading inquiries...</p>
      </div>
    );
  }

  return (
    <div className="admin-inquiries">
      {/* Header */}
      <div className="inquiries-header">
        <div>
          <h1>Inquiries</h1>
          <p>Manage customer inquiries and messages</p>
        </div>
        <div className="inquiries-stats">
          <div className="stat-item">
            <span className="stat-value">{inquiries.filter(i => i.status === 'NEW').length}</span>
            <span className="stat-label">New</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{inquiries.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="inquiries-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({inquiries.length})
        </button>
        {Object.entries(statusColors).map(([status, config]) => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {config.label} ({inquiries.filter(i => i.status === status).length})
          </button>
        ))}
      </div>

      <div className="inquiries-content">
        {/* Inquiries List */}
        <div className="inquiries-list">
          {filteredInquiries.length === 0 ? (
            <div className="no-inquiries">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>No inquiries found</p>
            </div>
          ) : (
            filteredInquiries.map(inquiry => (
              <div
                key={inquiry.id}
                className={`inquiry-item ${selectedInquiry?.id === inquiry.id ? 'selected' : ''} ${inquiry.status === 'NEW' ? 'unread' : ''}`}
                onClick={() => {
                  setSelectedInquiry(inquiry);
                  if (inquiry.status === 'NEW') {
                    updateStatus(inquiry.id, 'READ');
                  }
                }}
              >
                <div className="inquiry-item-header">
                  <span className="inquiry-name">{inquiry.contactName}</span>
                  <span
                    className="inquiry-status"
                    style={{
                      background: statusColors[inquiry.status]?.bg,
                      color: statusColors[inquiry.status]?.text,
                    }}
                  >
                    {statusColors[inquiry.status]?.label}
                  </span>
                </div>
                <div className="inquiry-subject">{inquiry.subject || 'No subject'}</div>
                <div className="inquiry-preview">{inquiry.message?.substring(0, 80)}...</div>
                <div className="inquiry-meta">
                  <span className="inquiry-type">{typeLabels[inquiry.inquiryType]}</span>
                  <span className="inquiry-date">{formatDate(inquiry.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Inquiry Detail */}
        <div className="inquiry-detail">
          {selectedInquiry ? (
            <>
              <div className="detail-header">
                <div className="detail-title">
                  <h2>{selectedInquiry.subject || 'No subject'}</h2>
                  <span
                    className="detail-status"
                    style={{
                      background: statusColors[selectedInquiry.status]?.bg,
                      color: statusColors[selectedInquiry.status]?.text,
                    }}
                  >
                    {statusColors[selectedInquiry.status]?.label}
                  </span>
                </div>
                <div className="detail-actions">
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => updateStatus(selectedInquiry.id, e.target.value)}
                    disabled={updating}
                  >
                    {Object.entries(statusColors).map(([status, config]) => (
                      <option key={status} value={status}>{config.label}</option>
                    ))}
                  </select>
                  <button
                    className="btn-icon danger"
                    onClick={() => deleteInquiry(selectedInquiry.id)}
                    title="Delete"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="detail-contact">
                <div className="contact-info">
                  <div className="contact-avatar">
                    {selectedInquiry.contactName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="contact-details">
                    <span className="contact-name">{selectedInquiry.contactName}</span>
                    <a href={`mailto:${selectedInquiry.email}`} className="contact-email">
                      {selectedInquiry.email}
                    </a>
                    {selectedInquiry.phone && (
                      <a href={`tel:${selectedInquiry.phone}`} className="contact-phone">
                        {selectedInquiry.phone}
                      </a>
                    )}
                    {selectedInquiry.companyName && (
                      <span className="contact-company">{selectedInquiry.companyName}</span>
                    )}
                  </div>
                </div>
                <div className="contact-meta">
                  <span className="meta-type">{typeLabels[selectedInquiry.inquiryType]}</span>
                  <span className="meta-date">{formatDate(selectedInquiry.createdAt)}</span>
                </div>
              </div>

              <div className="detail-message">
                <h3>Message</h3>
                <p>{selectedInquiry.message}</p>
              </div>

              <div className="detail-reply">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject || 'Your Inquiry'}`}
                  className="btn-primary"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Reply via Email
                </a>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>Select an inquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inquiries;
