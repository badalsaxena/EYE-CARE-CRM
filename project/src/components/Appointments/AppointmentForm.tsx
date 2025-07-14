import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User } from 'lucide-react';
import { supabase, Database } from '../../lib/supabase';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type Patient = Database['public']['Tables']['patients']['Row'];

interface AppointmentFormProps {
  appointment?: Appointment | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export function AppointmentForm({ appointment, onSubmit, onCancel }: AppointmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState<AppointmentInsert>({
    patient_id: appointment?.patient_id || '',
    appointment_date: appointment?.appointment_date ? 
      new Date(appointment.appointment_date).toISOString().slice(0, 16) : 
      '',
    appointment_type: appointment?.appointment_type || 'General Consultation',
    status: appointment?.status || 'Scheduled',
    notes: appointment?.notes || '',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appointmentData = {
        ...formData,
        appointment_date: new Date(formData.appointment_date).toISOString(),
      };

      if (appointment) {
        // Update existing appointment
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointment.id);

        if (error) throw error;
      } else {
        // Create new appointment 
        const { error } = await supabase
          .from('appointments')
          .insert([appointmentData]);

        if (error) throw error;
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Error saving appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const appointmentTypes = [
    'General Consultation',
    'Eye Examination',
    'Follow-up',
    'Contact Lens Fitting',
    'Glaucoma Check',
    'Diabetic Eye Screening',
    'Cataract Consultation',
    'Emergency Visit',
  ];

  const statusOptions = [
    'Scheduled',
    'Confirmed',
    'In Progress',
    'Completed',
    'Cancelled',
    'No Show',
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Appointments
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
        </h1>
        <p className="text-gray-600">
          {appointment ? 'Update appointment details' : 'Schedule a new patient appointment'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-2">
                Patient *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  id="patient_id"
                  name="patient_id"
                  required
                  value={formData.patient_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                id="appointment_date"
                name="appointment_date"
                required
                value={formData.appointment_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="appointment_type" className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type *
              </label>
              <select
                id="appointment_type"
                name="appointment_type"
                required
                value={formData.appointment_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                {appointmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Additional notes or special instructions..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Saving...' : 'Save Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}