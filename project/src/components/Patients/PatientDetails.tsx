import { useEffect, useState } from 'react';
import { ArrowLeft, Edit, Calendar, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { supabase, Database } from '../../lib/supabase';

type Patient = Database['public']['Tables']['patients']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];

interface PatientDetailsProps {
  patient: Patient;
  onBack: () => void;
  onEdit: () => void;
}

export function PatientDetails({ patient, onBack, onEdit }: PatientDetailsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, [patient.id]);

  const fetchPatientData = async () => {
    try {
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .order('appointment_date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      const { data: recordsData, error: recordsError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patient.id)
        .order('visit_date', { ascending: false });

      if (recordsError) throw recordsError;

      setAppointments(appointmentsData || []);
      setMedicalRecords(recordsData || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Patients
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-gray-600">Patient Details</p>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Edit className="h-5 w-5 mr-2" />
            Edit Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>

            <div className="space-y-4">
              {patient.email && (
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{patient.email}</p>
                  </div>
                </div>
              )}

              {patient.phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900">{patient.phone}</p>
                  </div>
                </div>
              )}

              {patient.date_of_birth && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="text-gray-900">
                      {new Date(patient.date_of_birth).toLocaleDateString()} ({calculateAge(patient.date_of_birth)} years old)
                    </p>
                  </div>
                </div>
              )}

              {patient.address && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-gray-900">{patient.address}</p>
                  </div>
                </div>
              )}

              {patient.emergency_contact && (
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Emergency Contact</p>
                    <p className="text-gray-900">{patient.emergency_contact}</p>
                  </div>
                </div>
              )}
            </div>

            {patient.insurance_info && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Insurance Information</h3>
                <p className="text-gray-600 text-sm">{patient.insurance_info}</p>
              </div>
            )}

            {patient.medical_history && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Medical History</h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{patient.medical_history}</p>
              </div>
            )}
          </div>
        </div>

        {/* Appointments and Records */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Appointments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-200 h-16 rounded"></div>
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments found</p>
              ) : (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.appointment_type}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.appointment_date).toLocaleString()}
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Medical Records */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Medical Records</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-200 h-20 rounded"></div>
                  ))}
                </div>
              ) : medicalRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No medical records found</p>
              ) : (
                <div className="space-y-4">
                  {medicalRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">
                          Visit - {new Date(record.visit_date).toLocaleDateString()}
                        </p>
                        {record.doctor_name && (
                          <p className="text-sm text-gray-600">Dr. {record.doctor_name}</p>
                        )}
                      </div>
                      {record.diagnosis && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                          <p className="text-sm text-gray-600">{record.diagnosis}</p>
                        </div>
                      )}
                      {record.treatment && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">Treatment:</p>
                          <p className="text-sm text-gray-600">{record.treatment}</p>
                        </div>
                      )}
                      {record.prescription && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">Prescription:</p>
                          <p className="text-sm text-gray-600">{record.prescription}</p>
                        </div>
                      )}
                      {record.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Notes:</p>
                          <p className="text-sm text-gray-600">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
