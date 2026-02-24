import { useState, useEffect } from 'react';
import { equipmentAPI } from '../api';
import { useAuth } from '../AuthContext';

const STATUS_COLORS = {
    available: 'bg-green-100 text-green-700',
    reserved: 'bg-blue-100 text-blue-700',
    rented_out: 'bg-orange-100 text-orange-700',
    returned: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-700',
    damaged: 'bg-red-200 text-red-800',
};

export default function EquipmentPage() {
    const { user } = useAuth();
    const [equipment, setEquipment] = useState([]);
    const [categories, setCategories] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('browse');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBookForm, setShowBookForm] = useState(null); // holds selected equipment
    const [lateFee, setLateFee] = useState(null);
    const [addForm, setAddForm] = useState({
        categoryId: '', equipmentName: '', equipmentDescription: '',
        equipmentCondition: 'good', rentalPricePerDay: '', depositAmount: '', quantityTotal: 1
    });
    const [bookForm, setBookForm] = useState({ rentalStartDate: '', rentalEndDate: '', notes: '' });
    const [error, setError] = useState('');

    const loadEquipment = async () => {
        setLoading(true);
        try {
            const [eqRes, catRes] = await Promise.all([
                equipmentAPI.getAvailable(),
                equipmentAPI.getCategories()
            ]);
            setEquipment(eqRes.data.data || []);
            setCategories(catRes.data.data || []);
        } catch {
            setError('Failed to load equipment.');
        } finally {
            setLoading(false);
        }
    };

    const loadMyBookings = async () => {
        setLoading(true);
        try {
            const res = await equipmentAPI.getMyBookings();
            setMyBookings(res.data.data || []);
        } catch {
            setError('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tab === 'browse') loadEquipment();
        else loadMyBookings();
    }, [tab]);

    const handleAddEquipment = async (e) => {
        e.preventDefault();
        try {
            await equipmentAPI.add({ ...addForm, categoryId: parseInt(addForm.categoryId), quantityTotal: parseInt(addForm.quantityTotal) });
            alert('Equipment added!');
            setShowAddForm(false);
            loadEquipment();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add equipment');
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            await equipmentAPI.book({ equipmentId: showBookForm.equipmentId, ...bookForm });
            alert('Equipment booked successfully!');
            setShowBookForm(null);
            loadEquipment();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const handleReturn = async (bookingId) => {
        try {
            const res = await equipmentAPI.returnEquipment(bookingId);
            alert('Equipment returned!' + (res.data.data?.lateFee > 0 ? ` Late fee: LKR ${res.data.data.lateFee}` : ''));
            loadMyBookings();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const handleCalcLateFee = async (bookingId) => {
        try {
            const res = await equipmentAPI.calculateLateFee(bookingId);
            setLateFee(res.data.data);
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this equipment?')) return;
        try {
            await equipmentAPI.delete(id);
            loadEquipment();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">🔧 Equipment Rental</h1>
                    <p className="text-slate-500 text-sm">Browse and rent tools & equipment</p>
                </div>
                <div className="flex gap-2">
                    {(user?.role === 'supplier' || user?.role === 'admin') && (
                        <button onClick={() => setShowAddForm(true)} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors shadow">
                            + Add Equipment
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {['browse', 'my-rentals'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        {t === 'browse' ? '🔧 Browse Equipment' : '📦 My Rentals'}
                    </button>
                ))}
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : tab === 'browse' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipment.length === 0 ? (
                        <div className="col-span-3 bg-white rounded-2xl p-12 text-center border border-slate-100">
                            <div className="text-5xl mb-3">🔧</div>
                            <p className="text-slate-500">No equipment available.</p>
                        </div>
                    ) : equipment.map(eq => (
                        <div key={eq.equipmentId} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-bold text-slate-800 text-base">{eq.equipmentName}</h3>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium capitalize">
                                    {eq.equipmentCondition?.replace('_', '')}
                                </span>
                            </div>
                            {eq.equipmentDescription && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{eq.equipmentDescription}</p>}
                            <div className="text-xs text-slate-400 space-y-1 mb-4">
                                <p>🏷 {eq.equipmentCategory?.categoryName}</p>
                                <p>💰 LKR {eq.rentalPricePerDay}/day</p>
                                <p>🔒 Deposit: LKR {eq.depositAmount}</p>
                                <p>📦 Available: {eq.quantityAvailable}/{eq.quantityTotal}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setShowBookForm(eq); setBookForm({ rentalStartDate: '', rentalEndDate: '', notes: '' }); }}
                                    className="flex-1 bg-purple-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-purple-700 transition-colors"
                                >
                                    Rent Now
                                </button>
                                {(user?.role === 'supplier' || user?.role === 'admin') && (
                                    <button onClick={() => handleDelete(eq.equipmentId)} className="bg-red-50 text-red-500 rounded-xl px-3 py-2 text-sm hover:bg-red-100 transition-colors">
                                        🗑
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {myBookings.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                            <div className="text-5xl mb-3">📦</div>
                            <p className="text-slate-500">No rentals yet.</p>
                        </div>
                    ) : myBookings.map(b => (
                        <div key={b.equipmentBookingId} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-slate-800">{b.equipment?.equipmentName}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.bookingStatus] || 'bg-gray-100 text-gray-600'}`}>
                                            {b.bookingStatus?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500 space-y-1">
                                        <p>📅 {b.rentalStartDate} → {b.rentalEndDate}</p>
                                        <p>💰 Base: LKR {b.baseRentalCost} ({b.totalDays} days × LKR {b.dailyRate}/day)</p>
                                        {b.lateFee > 0 && <p className="text-red-500 font-medium">⚠️ Late fee: LKR {b.lateFee}</p>}
                                        <p className="font-semibold text-slate-700">Total: LKR {b.totalCost}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                    {(b.bookingStatus === 'rented_out' || b.bookingStatus === 'reserved') && (
                                        <>
                                            <button onClick={() => handleReturn(b.equipmentBookingId)}
                                                className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                                                Return
                                            </button>
                                            <button onClick={() => handleCalcLateFee(b.equipmentBookingId)}
                                                className="text-xs bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
                                                Late Fee?
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Equipment Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-5">Add Equipment</h2>
                        <form onSubmit={handleAddEquipment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                                <select required value={addForm.categoryId} onChange={e => setAddForm({ ...addForm, categoryId: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="">Select category</option>
                                    {categories.map(c => <option key={c.equipmentCategoryId} value={c.equipmentCategoryId}>{c.categoryName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Equipment Name</label>
                                <input required value={addForm.equipmentName} onChange={e => setAddForm({ ...addForm, equipmentName: e.target.value })}
                                    placeholder="e.g. Hammer Drill"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                                <textarea value={addForm.equipmentDescription} onChange={e => setAddForm({ ...addForm, equipmentDescription: e.target.value })} rows={2}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Condition</label>
                                <select value={addForm.equipmentCondition} onChange={e => setAddForm({ ...addForm, equipmentCondition: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    {['new_', 'excellent', 'good', 'fair'].map(c => <option key={c} value={c}>{c.replace('_', '')}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Price/Day (LKR)</label>
                                    <input required type="number" value={addForm.rentalPricePerDay} onChange={e => setAddForm({ ...addForm, rentalPricePerDay: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Deposit (LKR)</label>
                                    <input required type="number" value={addForm.depositAmount} onChange={e => setAddForm({ ...addForm, depositAmount: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Quantity</label>
                                <input type="number" min="1" value={addForm.quantityTotal} onChange={e => setAddForm({ ...addForm, quantityTotal: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-purple-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-purple-700 transition-colors">Add</button>
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-slate-100 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Book Modal */}
            {showBookForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-1">Rent: {showBookForm.equipmentName}</h2>
                        <p className="text-sm text-slate-500 mb-5">LKR {showBookForm.rentalPricePerDay}/day · Deposit: LKR {showBookForm.depositAmount}</p>
                        <form onSubmit={handleBook} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
                                    <input required type="date" value={bookForm.rentalStartDate} onChange={e => setBookForm({ ...bookForm, rentalStartDate: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
                                    <input required type="date" value={bookForm.rentalEndDate} onChange={e => setBookForm({ ...bookForm, rentalEndDate: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Notes (optional)</label>
                                <textarea value={bookForm.notes} onChange={e => setBookForm({ ...bookForm, notes: e.target.value })} rows={2}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-purple-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-purple-700 transition-colors">Confirm Rental</button>
                                <button type="button" onClick={() => setShowBookForm(null)} className="flex-1 bg-slate-100 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Late Fee Modal */}
            {lateFee && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-5">⚠️ Late Fee Calculation</h2>
                        {lateFee.daysOverdue === 0 ? (
                            <p className="text-green-600 font-medium">✅ Not overdue! No late fee applies.</p>
                        ) : (
                            <div className="space-y-2 text-sm text-slate-700">
                                <p>📅 Due: <strong>{lateFee.rentalEndDate}</strong></p>
                                <p>⏱ Days overdue: <strong className="text-red-600">{lateFee.daysOverdue}</strong></p>
                                <p>💰 Daily late fee rate: <strong>LKR {lateFee.dailyLateFeeRate}</strong></p>
                                <p className="text-lg font-extrabold text-red-600 pt-2 border-t border-slate-100">
                                    Total Late Fee: LKR {lateFee.totalLateFee}
                                </p>
                            </div>
                        )}
                        <button onClick={() => setLateFee(null)} className="mt-6 w-full bg-slate-100 rounded-xl py-2 text-sm font-semibold hover:bg-slate-200 transition-colors">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
