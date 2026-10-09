"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, IndianRupee, MapPin, Plus, Loader2, Edit, Trash2, Check, X, Eye } from 'lucide-react';
import { getAllEvents, joinEvent, createEvent, getMyEvents, updateEvent, deleteEvent, getEventParticipants, approveParticipant, rejectParticipant, verifyEventPayment, EventData } from '@/services/events';
import { customerTurfsService, TurfData, Sport } from '@/services/customer-turfs';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';

export default function CustomerEventsPage() {
	const [activeTab, setActiveTab] = useState<'feed' | 'my-events'>('feed');
	
	const [events, setEvents] = useState<EventData[]>([]);
	const [myCreatedEvents, setMyCreatedEvents] = useState<EventData[]>([]);
	const [myJoinedEvents, setMyJoinedEvents] = useState<EventData[]>([]);
	const [loading, setLoading] = useState(true);
	
	const [joiningId, setJoiningId] = useState<string | null>(null);
	const [transactionId, setTransactionId] = useState('');
	const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

	// Create/Edit Event State
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [editEventId, setEditEventId] = useState<string | null>(null);

	// Manage Participants State
	const [isManageModalOpen, setIsManageModalOpen] = useState(false);
	const [participants, setParticipants] = useState<any[]>([]);
	const [manageEventId, setManageEventId] = useState<string | null>(null);

	const [turfs, setTurfs] = useState<TurfData[]>([]);
	const [selectedTurf, setSelectedTurf] = useState<string>('');
	const [eventName, setEventName] = useState('');
	const [eventDescription, setEventDescription] = useState('');
	const [eventDate, setEventDate] = useState('');
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');
	const [maxPlayers, setMaxPlayers] = useState('');
	const [totalPrice, setTotalPrice] = useState('');
	const [upiId, setUpiId] = useState('');

	const fetchTurfs = async () => {
		try {
			const res = await customerTurfsService.getTurfs();
			if (res.success && res.data) {
				setTurfs(res.data);
			}
		} catch (e) {
			console.error(e);
		}
	};

	const fetchAllData = async () => {
		try {
			setLoading(true);
			const [feedRes, myEventsRes] = await Promise.all([
				getAllEvents(),
				getMyEvents()
			]);

			if (feedRes.success) {
				setEvents(feedRes.data);
			}
			if (myEventsRes.success && myEventsRes.data) {
				setMyCreatedEvents(myEventsRes.data.created || []);
				setMyJoinedEvents(myEventsRes.data.joined || []);
			}
		} catch (error) {
			console.error("Error fetching events:", error);
			toast.error("Failed to load events");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAllData();
		fetchTurfs();
	}, []);

	const openJoinModal = (event: EventData) => {
		setSelectedEvent(event);
		setTransactionId('');
		setIsJoinModalOpen(true);
	};

	const handleJoin = async () => {
		if (!selectedEvent) return;
		if (!transactionId.trim()) {
			toast.error('Please enter the transaction ID');
			return;
		}

		try {
			setJoiningId(selectedEvent.id);
			const response = await joinEvent(selectedEvent.id, transactionId);
			if (response.success) {
				toast.success("Join request sent! Waiting for creator approval.");
				setIsJoinModalOpen(false);
				fetchAllData();
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to join event");
		} finally {
			setJoiningId(null);
		}
	};

	const openCreateModal = () => {
		setEditEventId(null);
		setSelectedTurf('');
		setEventName('');
		setEventDescription('');
		setEventDate('');
		setStartTime('');
		setEndTime('');
		setMaxPlayers('');
		setTotalPrice('');
		setUpiId('');
		setIsCreateModalOpen(true);
	};

	const openEditModal = (event: EventData) => {
		setEditEventId(event.id);
		setSelectedTurf(event.turf_id);
		setEventName(event.name || '');
		setEventDescription(event.description || '');
		setEventDate(new Date(event.date).toISOString().split('T')[0]);
		setStartTime(event.start_time.substring(0, 5));
		setEndTime(event.end_time.substring(0, 5));
		setMaxPlayers(event.max_players.toString());
		setTotalPrice(event.total_price);
		setUpiId(event.upi_id);
		setIsCreateModalOpen(true);
	};

	const handleSaveEvent = async () => {
		if (!eventName || !selectedTurf || !eventDate || !startTime || !endTime || !maxPlayers || !totalPrice || !upiId) {
			toast.error('Please fill all required fields');
			return;
		}

		const loadRazorpay = () => {
			return new Promise((resolve) => {
				const script = document.createElement('script');
				script.src = 'https://checkout.razorpay.com/v1/checkout.js';
				script.onload = () => resolve(true);
				script.onerror = () => resolve(false);
				document.body.appendChild(script);
			});
		};

		try {
			setIsCreating(true);
			const payload = {
				name: eventName,
				description: eventDescription,
				turf_id: selectedTurf,
				date: eventDate,
				start_time: startTime,
				end_time: endTime,
				max_players: parseInt(maxPlayers),
				total_price: parseFloat(totalPrice),
				upi_id: upiId
			};

			let res: any;
			if (editEventId) {
				res = await updateEvent(editEventId, payload);
				if (res.success) {
					toast.success('Event updated successfully!');
					setIsCreateModalOpen(false);
					setActiveTab('my-events');
					fetchAllData();
				}
			} else {
				res = await createEvent(payload);
				if (res.success && res.order_id) {
					toast.success('Initializing payment...');
					const resLoad = await loadRazorpay();
					if (!resLoad) {
						toast.error("Payment SDK failed to load. Please check your connection.");
						return;
					}

					const options = {
						key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY", 
						amount: res.amount,
						currency: res.currency || "INR",
						name: "Turf Arena",
						description: `Booking Turf for Event: ${eventName}`,
						order_id: res.order_id,
						handler: async function (response: any) {
							toast.info("Verifying payment...");
							try {
								const verifyRes = await verifyEventPayment({
									event_id: res.data.id,
									razorpay_order_id: response.razorpay_order_id,
									razorpay_payment_id: response.razorpay_payment_id,
									razorpay_signature: response.razorpay_signature
								});
								if (verifyRes.success) {
									toast.success("Event created and payment verified successfully!");
									setIsCreateModalOpen(false);
									setActiveTab('my-events');
									fetchAllData();
								} else {
									toast.error(verifyRes.message || "Payment verification failed.");
								}
							} catch(err: any) {
								toast.error(err.response?.data?.message || "Payment verification error");
							}
						},
						prefill: {
							name: "Customer",
							email: "customer@example.com",
							contact: "9999999999"
						},
						theme: { color: "#2DD4BF" }
					};

					const paymentObject = new (window as any).Razorpay(options);
					paymentObject.open();
					
					paymentObject.on('payment.failed', function () {
						toast.error("Payment failed. Please try again.");
					});
				}
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || `Failed to ${editEventId ? 'update' : 'create'} event`);
		} finally {
			setIsCreating(false);
		}
	};

	const handleDeleteEvent = async (id: string) => {
		if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
		try {
			const res = await deleteEvent(id);
			if (res.success) {
				toast.success('Event deleted successfully');
				fetchAllData();
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Failed to delete event');
		}
	};

	const openManageModal = async (eventId: string) => {
		setManageEventId(eventId);
		setIsManageModalOpen(true);
		try {
			const res = await getEventParticipants(eventId);
			if (res.success) {
				setParticipants(res.data);
			}
		} catch (error) {
			toast.error('Failed to load participants');
		}
	};

	const handleApproveParticipant = async (participantId: string) => {
		if (!manageEventId) return;
		try {
			const res = await approveParticipant(manageEventId, participantId);
			if (res.success) {
				toast.success('Participant approved');
				// refresh
				const pRes = await getEventParticipants(manageEventId);
				if (pRes.success) setParticipants(pRes.data);
				fetchAllData();
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Failed to approve');
		}
	};

	const handleRejectParticipant = async (participantId: string) => {
		if (!manageEventId) return;
		try {
			const res = await rejectParticipant(manageEventId, participantId);
			if (res.success) {
				toast.success('Participant rejected');
				// refresh
				const pRes = await getEventParticipants(manageEventId);
				if (pRes.success) setParticipants(pRes.data);
				fetchAllData();
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Failed to reject');
		}
	};

	const createdEventIds = new Set(myCreatedEvents.map(e => e.id));
	const joinedEventIds = new Set(myJoinedEvents.map(e => e.id));

	return (
		<div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">Community Events</h1>
					<p className="text-muted-foreground mt-2">
						Join upcoming games or create your own to split the cost with others.
					</p>
				</div>
				<Button className="bg-brand-caribbean text-brand-dark-green hover:bg-brand-caribbean/90" onClick={openCreateModal}>
					<Plus className="w-4 h-4 mr-2" />
					Create Event
				</Button>
			</div>

			<div className="flex space-x-2 border-b border-border mb-6">
				<button 
					onClick={() => setActiveTab('feed')}
					className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'feed' ? 'border-b-2 border-brand-caribbean text-brand-caribbean' : 'text-muted-foreground hover:text-foreground'}`}
				>
					Community Feed
				</button>
				<button 
					onClick={() => setActiveTab('my-events')}
					className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'my-events' ? 'border-b-2 border-brand-caribbean text-brand-caribbean' : 'text-muted-foreground hover:text-foreground'}`}
				>
					My Events
				</button>
			</div>

			{loading ? (
				<div className="p-12 flex justify-center"><Loader2 className="animate-spin text-brand-caribbean w-10 h-10" /></div>
			) : activeTab === 'feed' ? (
				events.length === 0 ? (
					<EmptyState 
						title="No Events Found" 
						description="There are no open events right now. Be the first to create one!" 
						icon={Calendar} 
					/>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{events.map(event => {
							const isCreator = createdEventIds.has(event.id);
							const hasJoined = joinedEventIds.has(event.id);

							return (
								<Card key={event.id} className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all">
									<CardHeader className="bg-gradient-to-r from-brand-caribbean/20 to-transparent pb-4">
										<div className="flex justify-between items-start">
											<div>
												<CardTitle className="text-lg font-bold text-foreground">{event.name}</CardTitle>
												<CardDescription className="text-brand-dark-green font-medium mt-1 flex items-center">
													<MapPin className="w-3.5 h-3.5 mr-1" />
													{event.turf_name}
												</CardDescription>
											</div>
											<div className="bg-brand-caribbean/20 text-brand-caribbean text-xs font-bold px-2 py-1 rounded-md">
												{event.current_players || 0} / {event.max_players} joined
											</div>
										</div>
									</CardHeader>
									<CardContent className="pt-4 space-y-3">
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground flex items-center"><Calendar className="w-4 h-4 mr-2" /> Date</span>
											<span className="font-medium text-foreground">{new Date(event.date).toLocaleDateString()}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground flex items-center"><Clock className="w-4 h-4 mr-2" /> Time</span>
											<span className="font-medium text-foreground">{event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground flex items-center"><IndianRupee className="w-4 h-4 mr-2" /> Cost per person</span>
											<span className="font-bold text-brand-caribbean text-base">₹{event.price_per_person}</span>
										</div>
										
										{!isCreator && !hasJoined && (
											<div className="p-3 mt-4 bg-muted/50 rounded-lg border border-border">
												<p className="text-xs text-muted-foreground mb-1">Pay to Creator's UPI:</p>
												<p className="text-sm font-bold font-mono tracking-wider text-foreground">{event.upi_id}</p>
											</div>
										)}
									</CardContent>
									<CardFooter className="pt-0 pb-5 px-5">
										{isCreator ? (
											<Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80" disabled>
												You are the Host
											</Button>
										) : hasJoined ? (
											<Button className="w-full bg-brand-caribbean text-brand-dark-green" disabled>
												Already Requested
											</Button>
										) : (
											<Button 
												className="w-full bg-foreground text-background hover:bg-foreground/90"
												onClick={() => openJoinModal(event)}
												disabled={Number(event.current_players || 0) >= event.max_players}
											>
												{Number(event.current_players || 0) >= event.max_players ? 'Event Full' : 'Pay & Join Event'}
											</Button>
										)}
									</CardFooter>
								</Card>
							);
						})}
					</div>
				)
			) : (
				// My Events Tab
				<div className="space-y-8">
					<div>
						<h2 className="text-xl font-bold mb-4">Events I'm Hosting</h2>
						{myCreatedEvents.length === 0 ? (
							<p className="text-muted-foreground">You haven't created any events yet.</p>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{myCreatedEvents.map(event => (
									<Card key={event.id} className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all">
										<CardHeader className="bg-gradient-to-r from-brand-caribbean/20 to-transparent pb-4">
											<div className="flex justify-between items-start">
												<div>
													<CardTitle className="text-lg font-bold text-foreground">{event.name}</CardTitle>
													<CardDescription className="text-brand-dark-green font-medium mt-1 flex items-center">
														<MapPin className="w-3.5 h-3.5 mr-1" />
														{event.turf_name}
													</CardDescription>
												</div>
												<div className={`text-xs font-bold px-2 py-1 rounded-md ${event.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-600' : event.status === 'CANCELLED' ? 'bg-red-500/20 text-red-600' : 'bg-brand-caribbean/20 text-brand-caribbean'}`}>
													{event.status}
												</div>
											</div>
										</CardHeader>
										<CardContent className="pt-4 space-y-3">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Date</span>
												<span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Time</span>
												<span className="font-medium">{event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Target Cost</span>
												<span className="font-medium">₹{event.total_price}</span>
											</div>
										</CardContent>
										<CardFooter className="pt-0 pb-5 px-5 flex flex-col gap-2">
											<Button className="w-full bg-brand-caribbean text-brand-dark-green hover:bg-brand-caribbean/90" onClick={() => openManageModal(event.id)}>
												<Users className="w-4 h-4 mr-2" />
												Manage Requests
											</Button>
											<div className="flex w-full gap-2">
												<Button variant="outline" className="w-1/2" onClick={() => openEditModal(event)}>
													<Edit className="w-4 h-4 mr-2" />
													Edit
												</Button>
												<Button variant="danger" className="w-1/2 bg-red-50 text-red-600 hover:bg-red-100 border-red-200" onClick={() => handleDeleteEvent(event.id)}>
													<Trash2 className="w-4 h-4 mr-2" />
													Delete
												</Button>
											</div>
										</CardFooter>
									</Card>
								))}
							</div>
						)}
					</div>

					<div>
						<h2 className="text-xl font-bold mb-4">Events I've Joined</h2>
						{myJoinedEvents.length === 0 ? (
							<p className="text-muted-foreground">You haven't requested to join any events yet.</p>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{myJoinedEvents.map(event => (
									<Card key={event.id} className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all">
										<CardHeader className="bg-gradient-to-r from-brand-caribbean/20 to-transparent pb-4">
											<div className="flex justify-between items-start">
												<div>
													<CardTitle className="text-lg font-bold text-foreground">{event.name}</CardTitle>
													<CardDescription className="text-brand-dark-green font-medium mt-1 flex items-center">
														<MapPin className="w-3.5 h-3.5 mr-1" />
														{event.turf_name}
													</CardDescription>
												</div>
												<div className={`text-xs font-bold px-2 py-1 rounded-md ${event.join_status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-brand-caribbean/20 text-brand-caribbean'}`}>
													{event.join_status}
												</div>
											</div>
										</CardHeader>
										<CardContent className="pt-4 space-y-3">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Date</span>
												<span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Time</span>
												<span className="font-medium">{event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}</span>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Join Modal */}
			{isJoinModalOpen && selectedEvent && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
					<Card className="w-full max-w-md shadow-2xl border-border animate-in fade-in zoom-in duration-200">
						<CardHeader className="text-center pb-2">
							<CardTitle>Join {selectedEvent?.name}</CardTitle>
							<CardDescription>
								Scan QR or use the UPI ID below to pay ₹{selectedEvent.price_per_person}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6 pt-4">
							<div className="flex flex-col items-center justify-center space-y-4">
								<div className="bg-white p-3 rounded-xl shadow-sm border border-border">
									<QRCodeSVG 
										value={`upi://pay?pa=${selectedEvent.upi_id}&pn=${encodeURIComponent(selectedEvent.creator_name || 'Event Host')}&am=${selectedEvent.price_per_person}&cu=INR`} 
										size={180} 
										level="H"
										includeMargin={true}
									/>
								</div>
								<div className="text-center">
									<p className="text-xs text-muted-foreground mb-1">Or pay directly to:</p>
									<p className="text-base font-bold font-mono tracking-wider text-foreground bg-muted/50 px-3 py-1 rounded-md">{selectedEvent.upi_id}</p>
								</div>
							</div>

							<div className="space-y-2 border-t border-border pt-4">
								<label htmlFor="transactionId" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">UPI Transaction ID / UTR <span className="text-red-500">*</span></label>
								<Input 
									id="transactionId" 
									placeholder="e.g. 301234567890" 
									value={transactionId}
									onChange={(e) => setTransactionId(e.target.value)}
								/>
							</div>
						</CardContent>
						<CardFooter className="flex gap-3">
							<Button variant="outline" className="w-1/2" onClick={() => setIsJoinModalOpen(false)}>Cancel</Button>
							<Button 
								className="w-1/2 bg-brand-caribbean text-brand-dark-green" 
								onClick={handleJoin}
								disabled={joiningId === selectedEvent.id || !transactionId}
							>
								{joiningId === selectedEvent.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
								Confirm Payment
							</Button>
						</CardFooter>
					</Card>
				</div>
			)}

			{/* Create / Edit Event Modal */}
			{isCreateModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
					<Card className="w-full max-w-2xl shadow-2xl border-border animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
						<CardHeader>
							<CardTitle>{editEventId ? 'Edit Event' : 'Create an Event'}</CardTitle>
							<CardDescription>
								{editEventId ? 'Update your event details.' : 'Host a game, split the cost, and invite players. Needs owner approval.'}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto px-6 pb-2">
							<div className="space-y-2 md:col-span-2 mt-2">
								<label className="text-sm font-medium leading-none">Select Turf <span className="text-red-500">*</span></label>
								<select 
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									value={selectedTurf}
									onChange={(e) => {
										const turfId = e.target.value;
										setSelectedTurf(turfId);
										const turf = turfs.find(t => t.id === turfId);
										if (turf && turf.event_price) {
											setTotalPrice(turf.event_price);
										} else {
											setTotalPrice('');
										}
									}}
								>
									<option value="">-- Choose a Turf --</option>
									{turfs.filter(t => t.allow_events !== false).map(t => (
										<option key={t.id} value={t.id}>{t.name} ({t.city}) - ₹{t.event_price}</option>
									))}
								</select>
							</div>

							<div className="space-y-2 md:col-span-2">
								<label className="text-sm font-medium leading-none">Event Name <span className="text-red-500">*</span></label>
								<Input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g. Sunday Morning Football" />
							</div>
							
							<div className="space-y-2 md:col-span-2">
								<label className="text-sm font-medium leading-none">Description (Optional)</label>
								<textarea 
									className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									value={eventDescription}
									onChange={e => setEventDescription(e.target.value)}
									placeholder="e.g. Friendly 5v5 match, bring your own boots..."
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium leading-none">Date <span className="text-red-500">*</span></label>
								<Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium leading-none">Start Time <span className="text-red-500">*</span></label>
								<Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium leading-none">End Time <span className="text-red-500">*</span></label>
								<Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium leading-none">Max Players Needed <span className="text-red-500">*</span></label>
								<Input type="number" min="1" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} placeholder="e.g. 10" />
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium leading-none">Total Turf Cost (₹)</label>
								<Input type="number" min="0" value={totalPrice} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" placeholder="Select a turf first" />
							</div>

							<div className="space-y-2 md:col-span-2">
								<label className="text-sm font-medium leading-none">Your UPI ID <span className="text-red-500">*</span></label>
								<Input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" />
								<p className="text-xs text-muted-foreground mt-1">Players will pay to this ID when joining.</p>
							</div>
							
							{maxPlayers && totalPrice && parseInt(maxPlayers) > 0 ? (
								<div className="md:col-span-2 p-3 bg-brand-caribbean/10 text-brand-dark-green rounded-lg text-center font-bold">
									Cost per person will be: ₹{(parseFloat(totalPrice) / parseInt(maxPlayers)).toFixed(2)}
								</div>
							) : null}

						</CardContent>
						<CardFooter className="flex justify-end gap-3 pt-4 pb-6 border-t border-border mt-auto">
							<Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
							<Button 
								className="bg-brand-caribbean text-brand-dark-green hover:bg-brand-caribbean/90" 
								onClick={handleSaveEvent}
								disabled={isCreating}
							>
								{isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
								{editEventId ? 'Update Event' : 'Create Event'}
							</Button>
						</CardFooter>
					</Card>
				</div>
			)}

			{/* Manage Participants Modal */}
			{isManageModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
					<Card className="w-full max-w-2xl shadow-2xl border-border animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
						<CardHeader>
							<CardTitle>Manage Join Requests</CardTitle>
							<CardDescription>
								Review payments and approve or reject participants.
							</CardDescription>
						</CardHeader>
						<CardContent className="overflow-y-auto px-6 pb-2">
							{participants.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									No one has requested to join this event yet.
								</div>
							) : (
								<div className="space-y-4">
									{participants.map(p => (
										<div key={p.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-border rounded-lg bg-card">
											<div className="space-y-1 mb-3 sm:mb-0">
												<div className="font-bold text-foreground">{p.name}</div>
												<div className="text-sm text-muted-foreground">Phone: {p.phone || 'N/A'}</div>
												<div className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block mt-1 text-foreground">
													UTR: {p.payment_transaction_id}
												</div>
											</div>
											<div className="flex items-center gap-2">
												{p.status === 'PENDING' ? (
													<>
														<Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleApproveParticipant(p.id)}>
															<Check className="w-4 h-4 mr-1" /> Approve
														</Button>
														<Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleRejectParticipant(p.id)}>
															<X className="w-4 h-4 mr-1" /> Reject
														</Button>
													</>
												) : (
													<span className={`text-sm font-bold px-3 py-1 rounded-full ${p.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
														{p.status}
													</span>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
						<CardFooter className="flex justify-end pt-4 pb-6 border-t border-border mt-auto">
							<Button onClick={() => setIsManageModalOpen(false)}>Close</Button>
						</CardFooter>
					</Card>
				</div>
			)}
		</div>
	);
}
