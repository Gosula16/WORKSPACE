import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';

export default function CompanyDashboard(){
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [tests, setTests] = useState([]);
  const [profile, setProfile] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [jobForm, setJobForm] = useState({ title: '', description: '', requirements: '', location: '', salary: '', deadline: '' });
  const [testForm, setTestForm] = useState({ title: '', description: '', durationSec: 3600, questions: [] });
  const [profileForm, setProfileForm] = useState({ name: '', description: '', website: '', hrContact: '', logoUrl: '' });
  const [jobStatistics, setJobStatistics] = useState({ total: 0, active: 0, closed: 0 });
  const [pendingApplications, setPendingApplications] = useState([]);
  const [hiringAnalytics, setHiringAnalytics] = useState({ totalApplicants: 0, shortlisted: 0, selected: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, appsRes, testsRes, profileRes] = await Promise.all([
        api.get('/companies/jobs'),
        api.get('/companies/applications'),
        api.get('/companies/tests'),
        api.get('/companies/profile')
      ]);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
      setTests(testsRes.data);
      setProfile(profileRes.data);
      setProfileForm({
        name: profileRes.data.name || '',
        description: profileRes.data.description || '',
        website: profileRes.data.website || '',
        hrContact: profileRes.data.hrContact || '',
        logoUrl: profileRes.data.logoUrl || ''
      });

      // Calculate job statistics
      const totalJobs = jobsRes.data.length;
      const activeJobs = jobsRes.data.filter(job => job.status === 'open').length;
      const closedJobs = jobsRes.data.filter(job => job.status === 'closed').length;
      setJobStatistics({ total: totalJobs, active: activeJobs, closed: closedJobs });

      // Get pending applications
      const pending = appsRes.data.filter(app => app.status === 'applied');
      setPendingApplications(pending);

      // Calculate hiring analytics
      const totalApplicants = appsRes.data.length;
      const shortlisted = appsRes.data.filter(app => app.status === 'shortlisted').length;
      const selected = appsRes.data.filter(app => app.status === 'selected').length;
      setHiringAnalytics({ totalApplicants, shortlisted, selected });
    } catch (err) {
      console.error('Error loading company data:', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/companies/profile', profileForm);
      loadData();
      alert('Profile updated successfully');
    } catch (err) {
      alert('Error updating profile');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', jobForm);
      setJobForm({ title: '', description: '', requirements: '', location: '', salary: '', deadline: '' });
      loadData();
      alert('Job created successfully');
    } catch (err) {
      alert('Error creating job');
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tests', testForm);
      setTestForm({ title: '', description: '', durationSec: 3600, questions: [] });
      loadData();
      alert('Test created successfully');
    } catch (err) {
      alert('Error creating test');
    }
  };

  const handleShortlistCandidate = async (applicationId, status) => {
    try {
      await api.put(`/companies/applications/${applicationId}/status`, { status });
      loadData();
    } catch (err) {
      alert('Error updating application status');
    }
  };

  const handleSendInterviewLetter = async (applicationId) => {
    try {
      const app = applications.find(a => a._id === applicationId);
      await api.post('/companies/letters/interview', {
        candidateId: app.candidateId._id,
        jobId: app.jobId._id,
        content: 'You are invited for an interview.'
      });
      alert('Interview letter sent');
    } catch (err) {
      alert('Error sending interview letter');
    }
  };

  const handleSendOfferLetter = async (applicationId) => {
    try {
      const app = applications.find(a => a._id === applicationId);
      await api.post('/companies/letters/offer', {
        candidateId: app.candidateId._id,
        jobId: app.jobId._id,
        content: 'Congratulations! You have been offered the position.'
      });
      alert('Offer letter sent');
    } catch (err) {
      alert('Error sending offer letter');
    }
  };

  const handleFinalizeHiring = async (applicationId) => {
    try {
      const app = applications.find(a => a._id === applicationId);
      await api.post('/companies/letters/appointment', {
        candidateId: app.candidateId._id,
        jobId: app.jobId._id,
        content: 'Congratulations! You have been appointed to the position.'
      });
      loadData();
      alert('Hiring finalized');
    } catch (err) {
      alert('Error finalizing hiring');
    }
  };

  const handleEvaluateDescriptive = async (submissionId, marks) => {
    try {
      await api.put(`/tests/submissions/${submissionId}/evaluate`, { marks });
      loadData();
      alert('Evaluation updated');
    } catch (err) {
      alert('Error updating evaluation');
    }
  };

  const handlePublishTestResults = async (testId) => {
    try {
      await api.put(`/tests/${testId}/publish-results`);
      loadData();
      alert('Results published');
    } catch (err) {
      alert('Error publishing results');
    }
  };

  const handleEditJob = async (jobId) => {
    // Placeholder for edit functionality
    alert('Edit job functionality not implemented yet');
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}`);
      loadData();
      alert('Job deleted successfully');
    } catch (err) {
      alert('Error deleting job');
    }
  };

  const handleToggleJobStatus = async (jobId, newStatus) => {
    try {
      await api.put(`/jobs/${jobId}`, { status: newStatus });
      loadData();
      alert(`Job ${newStatus === 'open' ? 'opened' : 'closed'} successfully`);
    } catch (err) {
      alert('Error updating job status');
    }
  };

  return (
    <div className="dashboard">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Company Dashboard</h2>

      <div className="tabs mb-8">
        <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'active' : ''}>Overview</button>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>Profile</button>
        <button onClick={() => setActiveTab('jobs')} className={activeTab === 'jobs' ? 'active' : ''}>Jobs</button>
        <button onClick={() => setActiveTab('applications')} className={activeTab === 'applications' ? 'active' : ''}>Applications</button>
        <button onClick={() => setActiveTab('tests')} className={activeTab === 'tests' ? 'active' : ''}>Tests</button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Company Profile Overview</h3>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300"><strong>Name:</strong> {profile.name}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Description:</strong> {profile.description}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Website:</strong> {profile.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{profile.website}</a> : 'Not provided'}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>HR Contact:</strong> {profile.hrContact}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Job Statistics</h3>
            <div className="stats-grid">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{jobStatistics.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Jobs</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{jobStatistics.active}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Active Jobs</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{jobStatistics.closed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Closed Jobs</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Hiring Analytics</h3>
            <div className="stats-grid">
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{hiringAnalytics.totalApplicants}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Applicants</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{hiringAnalytics.shortlisted}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Shortlisted</div>
              </div>
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{hiringAnalytics.selected}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Selected</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Pending Applications</h3>
            <div className="space-y-2">
              {pendingApplications.slice(0, 5).map(app => (
                <div key={app._id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{app.candidateId.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{app.jobId.title}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Jobs</h3>
            <div className="space-y-2">
              {jobs.slice(0, 5).map(job => (
                <div key={job._id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{job.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{job.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    job.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Update Company Profile</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="Company Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                placeholder="Description"
                value={profileForm.description}
                onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
              <input
                type="url"
                placeholder="Website"
                value={profileForm.website}
                onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HR Contact</label>
              <input
                type="text"
                placeholder="HR Contact"
                value={profileForm.hrContact}
                onChange={(e) => setProfileForm({...profileForm, hrContact: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
              <input
                type="url"
                placeholder="Logo URL"
                value={profileForm.logoUrl}
                onChange={(e) => setProfileForm({...profileForm, logoUrl: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update Profile
            </button>
          </form>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Create New Job</h3>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Location"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  placeholder="Job Description"
                  value={jobForm.description}
                  onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements</label>
                <textarea
                  placeholder="Job Requirements"
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary</label>
                  <input
                    type="text"
                    placeholder="Salary"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    placeholder="Deadline"
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({...jobForm, deadline: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Job
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Posted Jobs</h3>
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job._id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{job.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{job.location} • {job.salary}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                      job.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditJob(job._id)}
                      className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors duration-200"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleToggleJobStatus(job._id, job.status === 'open' ? 'closed' : 'open')}
                      className={`px-3 py-1 text-white text-sm rounded transition-colors duration-200 ${
                        job.status === 'open' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {job.status === 'open' ? 'Close' : 'Open'} Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Applications</h3>
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{app.candidateId.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{app.jobId.title}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        app.status === 'applied' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        app.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        app.status === 'selected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {app.status}
                      </span>
                      {app.score && (
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Score: <strong>{app.score}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {app.status === 'applied' && (
                      <>
                        <button
                          onClick={() => handleShortlistCandidate(app._id, 'shortlisted')}
                          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded transition-colors duration-200"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleShortlistCandidate(app._id, 'rejected')}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors duration-200"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {app.status === 'shortlisted' && (
                      <>
                        <button
                          onClick={() => handleSendInterviewLetter(app._id)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors duration-200"
                        >
                          Send Interview Letter
                        </button>
                        <button
                          onClick={() => handleSendOfferLetter(app._id)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors duration-200"
                        >
                          Send Offer Letter
                        </button>
                      </>
                    )}
                    {app.status === 'selected' && (
                      <button
                        onClick={() => handleFinalizeHiring(app._id)}
                        className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-colors duration-200"
                      >
                        Finalize Hiring
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Create New Test</h3>
            <form onSubmit={handleCreateTest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Title</label>
                <input
                  type="text"
                  placeholder="Test Title"
                  value={testForm.title}
                  onChange={(e) => setTestForm({...testForm, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  placeholder="Test Description"
                  value={testForm.description}
                  onChange={(e) => setTestForm({...testForm, description: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (seconds)</label>
                <input
                  type="number"
                  placeholder="Duration (seconds)"
                  value={testForm.durationSec}
                  onChange={(e) => setTestForm({...testForm, durationSec: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Test
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Created Tests</h3>
            <div className="space-y-4">
              {tests.map(test => (
                <div key={test._id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{test.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{test.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Duration: {Math.floor(test.durationSec / 60)}m {test.durationSec % 60}s
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePublishTestResults(test._id)}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors duration-200"
                    >
                      Publish Results
                    </button>
                    <button
                      onClick={() => setActiveTab('manage-questions')}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors duration-200"
                    >
                      Manage Questions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Submissions for Evaluation</h3>
            <div className="space-y-4">
              {tests.flatMap(test => test.submissions || []).map(sub => (
                <div key={sub._id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{sub.candidateId.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{test.title}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Marks"
                      onChange={(e) => handleEvaluateDescriptive(sub._id, parseInt(e.target.value))}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
