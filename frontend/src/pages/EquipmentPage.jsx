import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { equipmentAPI } from '../api';

const CONDITION_COLORS = {
  new: 'badge-teal',
  excellent: 'badge-blue',
  good: 'badge-orange',
  fair: 'badge-gray',
};

const BOOKING_STATUS_COLORS = {
  available: 'badge-green',
  reserved: 'badge-orange',
  rented_out: 'badge-blue',
  returned: 'badge-green',
  damaged: 'badge-red',
  cancelled: 'badge-gray',
};

const MODAL_OVERLAY = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
};

const MODAL_CARD = {
  background: '#fff', borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
  padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto'
};

const EMPTY_FORM = {
  equipmentName: '', equipmentDescription: '', equipmentCondition: 'good',
  rentalPricePerDay: '', depositAmount: '', quantityAvailable: 1,
  quantityTotal: 1, equipmentCategoryId: '',
};

export default function EquipmentPage() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('browse');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [bookForm, setBookForm] = useState({ equipmentId: '', rentalStartDate: '', rentalEndDate: '', quantity: 1 });
  const [showBook, setShowBook] = useState(false);

  const isSupplier = user?.role === 'supplier';

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eqRes, catRes, bookRes] = await Promise.allSettled([
        isSupplier ? equipmentAPI.getAll() : equipmentAPI.getAvailable(),
        equipmentAPI.getCategories(),
        equipmentAPI.getMyBookings(),
      ]);
      setEquipment(eqRes.status === 'fulfilled' ? eqRes.value?.data?.data || [] : []);
      setCategories(catRes.status === 'fulfilled' ? catRes.value?.data?.data || [] : []);
      setMyBookings(bookRes.status === 'fulfilled' ? bookRes.value?.data?.data || [] : []);
    } catch { /* non-critical */ }
    finally { setLoading(false); }
  };

  const handleSubmitEquipment = async (e) => {
    e.preventDefault(); setError('');
    try {
      const payload = {
        categoryId: form.equipmentCategoryId ? parseInt(form.equipmentCategoryId) : null,
        equipmentName: form.equipmentName,
        equipmentDescription: form.equipmentDescription,
        equipmentCondition: form.equipmentCondition,
        rentalPricePerDay: form.rentalPricePerDay ? parseFloat(form.rentalPricePerDay) : null,
        depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : null,
        quantityTotal: form.quantityTotal ? parseInt(form.quantityTotal) : 1,
      };
      if (editId) { await equipmentAPI.update(editId, payload); }
      else { await equipmentAPI.add(payload); }
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null);
      loadData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save equipment.'); }
  };

  const handleEdit = (eq) => {
    setForm({
      equipmentName: eq.equipmentName || '', equipmentDescription: eq.equipmentDescription || '',
      equipmentCondition: eq.equipmentCondition || 'good',
      rentalPricePerDay: eq.rentalPricePerDay || '', depositAmount: eq.depositAmount || '',
      quantityAvailable: eq.quantityAvailable || 1, quantityTotal: eq.quantityTotal || 1,
      equipmentCategoryId: eq.equipmentCategoryId || eq.categoryId || '',
    });
    setEditId(eq.equipmentId || eq.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this equipment?')) return;
    try { await equipmentAPI.delete(id); loadData(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to delete.'); }
  };

  const handleBook = async (e) => {
    e.preventDefault(); setError('');
    try {
      await equipmentAPI.book(bookForm);
      setShowBook(false);
      setBookForm({ equipmentId: '', rentalStartDate: '', rentalEndDate: '', quantity: 1 });
      loadData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to book.'); }
  };

  const handleReturn = async (bookingId) => {
    try { await equipmentAPI.returnEquipment(bookingId); loadData(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to return.'); }
  };

  const openBookModal = (eq) => {
    setBookForm({ ...bookForm, equipmentId: eq.equipmentId || eq.id });
    setShowBook(true);
  };

  const TABS = isSupplier
    ? [{ key: 'browse', label: '🛠 My Inventory' }, { key: 'bookings', label: '📅 Rental Bookings' }]
    : [{ key: 'browse', label: '🔍 Browse Tools' }, { key: 'bookings', label: '📦 My Rentals' }];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{isSupplier ? 'Equipment Inventory' : 'Tool Rental'}</h1>
          <p className="page-subtitle">{isSupplier ? 'Manage and track your equipment listings' : 'Rent professional tools for your next project'}</p>
        </div>
        {isSupplier && (
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }} className="btn-primary">
            + Add Equipment
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700,
              background: tab === t.key ? 'linear-gradient(135deg,#0891b2,#0e7490)' : '#fff',
              color: tab === t.key ? '#fff' : '#64748b',
              border: tab === t.key ? 'none' : '1.5px solid #e0f2fe',
              boxShadow: tab === t.key ? '0 4px 12px rgba(8,145,178,0.2)' : 'none',
              transition: 'all 0.2s'
            }}>{t.label}</button>
        ))}
      </div>

      {error && <div className="alert-error" style={{ marginBottom: 20 }}>❌ {error}</div>}

      {/* Equipment Form Modal */}
      {showForm && (
        <div style={MODAL_OVERLAY} onClick={() => setShowForm(false)}>
          <div style={MODAL_CARD} onClick={e => e.stopPropagation()} className="scale-in">
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0c4a6e', marginBottom: 20 }}>
              {editId ? 'Edit Equipment' : 'Add New Equipment'}
            </h2>
            <form onSubmit={handleSubmitEquipment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="hm-label">Equipment Name</label>
                <input type="text" className="hm-input" required value={form.equipmentName} onChange={e => setForm({ ...form, equipmentName: e.target.value })} placeholder="e.g. Jackhammer" />
              </div>
              <div>
                <label className="hm-label">Description</label>
                <textarea className="hm-input" rows={2} value={form.equipmentDescription} onChange={e => setForm({ ...form, equipmentDescription: e.target.value })} placeholder="Brief details about the tool..." style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="hm-label">Condition</label>
                  <select className="hm-input" value={form.equipmentCondition} onChange={e => setForm({ ...form, equipmentCondition: e.target.value })}>
                    <option value="new">New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
                {categories.length > 0 && (
                  <div>
                    <label className="hm-label">Category</label>
                    <select className="hm-input" value={form.equipmentCategoryId} onChange={e => setForm({ ...form, equipmentCategoryId: e.target.value })}>
                      <option value="">Select</option>
                      {categories.map(c => <option key={c.equipmentCategoryId || c.id} value={c.equipmentCategoryId || c.id}>{c.categoryName}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="hm-label">Daily Rate (LKR)</label>
                  <input type="number" className="hm-input" required value={form.rentalPricePerDay} onChange={e => setForm({ ...form, rentalPricePerDay: e.target.value })} />
                </div>
                <div>
                  <label className="hm-label">Deposit (LKR)</label>
                  <input type="number" className="hm-input" required value={form.depositAmount} onChange={e => setForm({ ...form, depositAmount: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="hm-label">Available Qty</label>
                  <input type="number" className="hm-input" min="0" value={form.quantityAvailable} onChange={e => setForm({ ...form, quantityAvailable: e.target.value })} />
                </div>
                <div>
                  <label className="hm-label">Total Qty</label>
                  <input type="number" className="hm-input" min="1" value={form.quantityTotal} onChange={e => setForm({ ...form, quantityTotal: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editId ? 'Update Listing' : 'Submit Listing'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rent Modal */}
      {showBook && (
        <div style={MODAL_OVERLAY} onClick={() => setShowBook(false)}>
          <div style={MODAL_CARD} onClick={e => e.stopPropagation()} className="scale-in">
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0c4a6e', marginBottom: 20 }}>Rent Tool</h2>
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="hm-label">Start Date</label>
                  <input type="date" className="hm-input" required value={bookForm.rentalStartDate} onChange={e => setBookForm({ ...bookForm, rentalStartDate: e.target.value })} />
                </div>
                <div>
                  <label className="hm-label">End Date</label>
                  <input type="date" className="hm-input" required value={bookForm.rentalEndDate} onChange={e => setBookForm({ ...bookForm, rentalEndDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="hm-label">Quantity to Rent</label>
                <input type="number" className="hm-input" min="1" required value={bookForm.quantity} onChange={e => setBookForm({ ...bookForm, quantity: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirm Rental</button>
                <button type="button" onClick={() => setShowBook(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#0891b2', gap: 12 }}>
          <span className="spinner" /> Loading inventory...
        </div>
      ) : tab === 'browse' ? (
        equipment.length === 0 ? (
          <div className="hm-card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 4 }}>No equipment found</h3>
            <p style={{ color: '#64748b' }}>{isSupplier ? 'Start by adding your first tool to the inventory.' : 'There are no tools available for rent at the moment.'}</p>
          </div>
        ) : (
          <div className="grid-cards">
            {equipment.map(eq => (
              <div key={eq.equipmentId || eq.id} className="hm-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                    🔧
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0c4a6e', marginBottom: 2 }}>{eq.equipmentName}</h3>
                    <p style={{ fontSize: 12, color: '#64748b' }}>{eq.categoryName || 'General Equipment'}</p>
                  </div>
                </div>
                {eq.equipmentDescription && (
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 20, height: 40, overflow: 'hidden' }}>{eq.equipmentDescription}</p>
                )}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  <span className={`badge ${CONDITION_COLORS[eq.equipmentCondition] || 'badge-gray'}`}>
                    {eq.equipmentCondition}
                  </span>
                  <span className="badge badge-gray">Qty: {eq.quantityAvailable}/{eq.quantityTotal}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#0891b2' }}>Rs.{eq.rentalPricePerDay}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>/day</span>
                  </div>
                  {isSupplier ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleEdit(eq)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDelete(eq.equipmentId || eq.id)} className="btn-danger" style={{ padding: '6px 14px', fontSize: 12 }}>🗑</button>
                    </div>
                  ) : (
                    <button onClick={() => openBookModal(eq)} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Rent Now</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Bookings Tab */
        myBookings.length === 0 ? (
          <div className="hm-card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📜</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 4 }}>No rental history</h3>
            <p style={{ color: '#64748b' }}>Your equipment rental activity will be listed here.</p>
          </div>
        ) : (
          <div className="hm-card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontWeight: 700, color: '#64748b' }}>Equipment</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontWeight: 700, color: '#64748b' }}>Rental Period</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontWeight: 700, color: '#64748b' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontWeight: 700, color: '#64748b' }}>Total Cost</th>
                    <th style={{ textAlign: 'right', padding: '16px 20px', fontWeight: 700, color: '#64748b' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ divideY: '1px solid #f1f5f9' }}>
                  {myBookings.map(b => (
                    <tr key={b.equipmentBookingId || b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0c4a6e' }}>{b.equipmentName || `Item #${b.equipmentId}`}</td>
                      <td style={{ padding: '16px 20px', color: '#475569' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {b.rentalStartDate} <span style={{ opacity: 0.4 }}>→</span> {b.rentalEndDate}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`badge ${BOOKING_STATUS_COLORS[b.bookingStatus] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
                          {(b.bookingStatus || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0891b2' }}>Rs.{b.totalCost || 0}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {(b.bookingStatus === 'rented_out' || b.bookingStatus === 'reserved') && (
                          <button onClick={() => handleReturn(b.equipmentBookingId || b.id)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }}>
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
