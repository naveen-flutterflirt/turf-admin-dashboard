"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Calendar, Clock, Users, IndianRupee, MapPin } from 'lucide-react';
import { getOwnerEvents, ownerApproveEvent, EventData } from '@/services/events';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';

export default function OwnerEventsPage() {
	const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
	const [events, setEvents] = useState<EventData[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingId, setProcessingId] = useState<string | null>(null);

	const fetchEvents = async () => {
		try {
			setLoading(true);
			const response = await getOwnerEvents();
			if (response.success) {
				setEvents(response.data);
			}
		} catch (error) {
			console.error("Error fetching events:", error);
			toast.error("Failed to load events");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEvents();
	}, []);

	const handleAction = async (eventId: string, status: 'OPEN' | 'CANCELLED') => {
		try {
			setProcessingId(eventId);
			const response = await ownerApproveEvent(eventId, status);
			if (response.success) {
				toast.success(status === 'OPEN' ? "Event approved successfully!" : "Event rejected.");
				setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status } : e));
			}
		} catch (error) {
			console.error(`Error updating event status:`, error);
			toast.error("Failed to update event status");
		} finally {
			setProcessingId(null);
		}
	};

	if (loading) {
		return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-caribbean"></div></div>;
	}

	const filteredEvents = activeTab === 'pending' ? events.filter(e => e.status === 'PENDING') : events;

	return (
		<div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight text-foreground">Community Events</h1>
				<p className="text-muted-foreground mt-2">
					Review and manage community events created on your turfs.
				</p>
			</div>

			<div className="flex space-x-2 border-b border-border mb-6">
				<button 
					onClick={() => setActiveTab('pending')}
					className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'pending' ? 'border-b-2 border-brand-caribbean text-brand-caribbean' : 'text-muted-foreground hover:text-foreground'}`}
				>
					Pending Requests
				</button>
				<button 
					onClick={() => setActiveTab('all')}
					className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'all' ? 'border-b-2 border-brand-caribbean text-brand-caribbean' : 'text-muted-foreground hover:text-foreground'}`}
				>
					All Events
				</button>
			</div>

			{filteredEvents.length === 0 ? (
				<EmptyState 
					title={`No ${activeTab === 'pending' ? 'Pending' : ''} Events`} 
					description={`You have no ${activeTab === 'pending' ? 'events waiting for approval' : 'events'} right now.`} 
					icon={Calendar} 
				/>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredEvents.map(event => (
						<Card key={event.id} className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-shadow">
							<CardHeader className="bg-brand-caribbean/10 pb-4">
								<div className="flex justify-between items-start">
									<div>
										<CardTitle className="text-lg font-bold text-foreground">{event.sport_name} Event</CardTitle>
										<CardDescription className="text-brand-dark-green font-medium mt-1 flex items-center">
											<MapPin className="w-3.5 h-3.5 mr-1" />
											{event.turf_name}
										</CardDescription>
									</div>
									<div className={`text-xs font-bold px-2 py-1 rounded-md text-white ${
										event.status === 'OPEN' ? 'bg-brand-caribbean text-brand-dark-green' : 
										event.status === 'PENDING' ? 'bg-brand-orange' : 
										'bg-red-500'
									}`}>
										{event.status}
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
									<span className="text-muted-foreground flex items-center"><Users className="w-4 h-4 mr-2" /> Players Needed</span>
									<span className="font-medium text-foreground">{event.max_players}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground flex items-center"><IndianRupee className="w-4 h-4 mr-2" /> Price per person</span>
									<span className="font-medium text-brand-caribbean">₹{event.price_per_person}</span>
								</div>
								
								<div className="pt-3 mt-3 border-t border-border">
									<p className="text-xs text-muted-foreground mb-1">Created by:</p>
									<p className="text-sm font-medium text-foreground">{event.creator_name} <span className="text-muted-foreground ml-2">({event.creator_phone})</span></p>
								</div>
							</CardContent>
							{event.status === 'PENDING' && (
								<CardFooter className="flex gap-3 pt-0 pb-5 px-5">
									<Button 
										variant="outline" 
										className="w-1/2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
										onClick={() => handleAction(event.id, 'CANCELLED')}
										disabled={processingId === event.id}
									>
										{processingId === event.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div> : <><X className="w-4 h-4 mr-2" /> Reject</>}
									</Button>
									<Button 
										className="w-1/2 bg-brand-caribbean text-brand-dark-green hover:bg-brand-caribbean/90"
										onClick={() => handleAction(event.id, 'OPEN')}
										disabled={processingId === event.id}
									>
										{processingId === event.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-dark-green"></div> : <><Check className="w-4 h-4 mr-2" /> Approve</>}
									</Button>
								</CardFooter>
							)}
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
