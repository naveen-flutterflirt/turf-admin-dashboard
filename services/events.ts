import axios from '@/lib/axios';

export interface EventData {
	id: string;
	turf_id: string;
	name: string;
	description?: string;
	creator_id: string;
	sport_id?: string;
	date: string;
	start_time: string;
	end_time: string;
	max_players: number;
	total_price: string;
	price_per_person: string;
	upi_id: string;
	status: string;
	created_at: string;
	turf_name?: string;
	address?: string;
	sport_name?: string;
	creator_name?: string;
	creator_phone?: string;
	current_players?: string;
	join_status?: string;
	payment_transaction_id?: string;
}

export const createEvent = async (data: {
	name: string;
	description?: string;
	turf_id: string;
	date: string;
	start_time: string;
	end_time: string;
	max_players: number;
	total_price: number;
	upi_id: string;
}) => {
	const response = await axios.post('/events/create', data);
	return response.data;
};

export const verifyEventPayment = async (data: {
	event_id: string;
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
}) => {
	const response = await axios.post('/events/verify-payment', data);
	return response.data;
};

export const updateEvent = async (id: string, data: {
	name: string;
	description?: string;
	turf_id: string;
	date: string;
	start_time: string;
	end_time: string;
	max_players: number;
	total_price: number;
	upi_id: string;
}) => {
	const response = await axios.put(`/events/${id}`, data);
	return response.data;
};

export const deleteEvent = async (id: string) => {
	const response = await axios.delete(`/events/${id}`);
	return response.data;
};

export const getEventParticipants = async (eventId: string) => {
	const response = await axios.get(`/events/${eventId}/participants`);
	return response.data;
};

export const approveParticipant = async (eventId: string, participantId: string) => {
	const response = await axios.put(`/events/${eventId}/participants/${participantId}/approve`);
	return response.data;
};

export const rejectParticipant = async (eventId: string, participantId: string) => {
	const response = await axios.put(`/events/${eventId}/participants/${participantId}/reject`);
	return response.data;
};

export const getAllEvents = async () => {
	const response = await axios.get('/events');
	return response.data;
};

export const getMyEvents = async () => {
	const response = await axios.get('/events/my-events');
	return response.data;
};

export const joinEvent = async (eventId: string, payment_transaction_id: string) => {
	const response = await axios.post(`/events/${eventId}/join`, { payment_transaction_id });
	return response.data;
};

export const getOwnerPendingEvents = async () => {
	const response = await axios.get('/events/owner/pending');
	return response.data;
};

export const ownerApproveEvent = async (eventId: string, status: 'OPEN' | 'CANCELLED') => {
	const response = await axios.put(`/events/owner/${eventId}/status`, { status });
	return response.data;
};


