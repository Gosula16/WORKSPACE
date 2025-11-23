import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';

export default function CandidateDashboard(){
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({});
  const [testResults, setTestResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [letters, setLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', education: [], skills: [], bio: '' });
  const [currentTest, setCurrentTest] = useState(null);
  const [testAnswers, setTestAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [appliedJobsSummary, setAppliedJobsSummary] = useState({ total: 0, shortlisted: 0, selected: 0, rejected: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, appsRes, profileRes, resultsRes, notifsRes, lettersRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/candidate/applications'),
        api.get('/candidate/me'),
        api.get('/candidate/test-results'),
        api.get('/candidate/notifications'),
        api.get('/candidate/letters')
      ]);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
      setProfile(profileRes.data);
      setTestResults(resultsRes.data);
      setNotifications(notifsRes.data);
      setLetters(lettersRes.data);
      setProfileForm({
        name: profileRes.data.name || '',
        phone: profileRes.data.profile?.phone || '',
        education: profileRes.data.profile?.education || [],
        skills: profileRes.data.profile?.skills || [],
        bio: profileRes.data.profile?.bio || ''
      });

      // Calculate applied jobs summary
      const total = appsRes.data.length;
      const shortlisted = appsRes.data.filter(app => app.status === 'shortlisted').length;
      const selected = appsRes.data.filter(app => app.status === 'selected').length;
      const rejected = appsRes.data.filter(app => app.status === 'rejected').length;
      setAppliedJobsSummary({ total, shortlisted, selected, rejected });

      // Get recent applications (last 5)
      const recent = appsRes.data.slice(-5).reverse();
      setRecentApplications(recent);

      // Get upcoming tests
      const upcoming = appsRes.data.filter(app => app.testId && app.status === 'applied').map(app => ({
        testId: app.testId,
        jobTitle: app.jobId.title,
        deadline: app.testId.deadline
      }));
      setUpcomingTests(upcoming);

      // Get applied job IDs for disabling apply button
      const appliedIds = appsRes.data.map(app => app.jobId._id);
      setAppliedJobsSummary(prev => ({ ...prev, appliedIds }));
    } catch (err) {
      console.error('Error loading candidate data:', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', profileForm.name);
      formData.append('profile.phone', profileForm.phone);
      formData.append('profile.education', JSON.stringify(profileForm.education));
      formData.append('profile.skills', JSON.stringify(profileForm.skills));
      formData.append('profile.bio', profileForm.bio);
      // Add resume file if selected
      const resumeInput = document.getElementById('resume');
      if (resumeInput.files[0]) {
        formData.append('resume', resumeInput.files[0]);
      }

      await api.put('/candidate/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      loadData();
      alert('Profile updated successfully');
    } catch (err) {
      alert('Error updating profile');
    }
  };

  const handleApplyJob = async (jobId) => {
    try {
      const formData = new FormData();
      const resumeInput = document.getElementById(`resume-${jobId}`);
      if (resumeInput.files[0]) {
        formData.append('resume', resumeInput.files[0]);
      }
      await api.post(`/candidate/jobs/${jobId}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      loadData();
      alert('Application submitted successfully');
    } catch (err) {
      alert('Error applying for job');
    }
  };

  const handleDownloadLetter = async (letterId) => {
    try {
      const response = await api.get(`/candidate/letters/${letterId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'letter.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Error downloading letter');
    }
  };

  return (
    <div className="dashboard">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Candidate Dashboard</h2>

      <div className="tabs mb-8">
        <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'active' : ''}>Overview</button>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>Profile</button>
        <button onClick={() => setActiveTab('jobs')} className={activeTab === 'jobs' ? 'active' : ''}>Jobs</button>
        <button onClick={() => setActiveTab('applications')} className={activeTab === 'applications' ? 'active' : ''}>Applications</button>
        <button onClick={() => setActiveTab('take-test')} className={activeTab === 'take-test' ? 'active' : ''}>Take Test</button>
        <button onClick={() => setActiveTab('results')} className={activeTab === 'results' ? 'active' : ''}>Test Results</button>
        <button onClick={() => setActiveTab('notifications')} className={activeTab === 'notifications' ? 'active' : ''}>Notifications</button>
        <button onClick={() => setActiveTab('letters')} className={activeTab === 'letters' ? 'active' : ''}>Letters</button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Profile Overview</h3>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300"><strong>Name:</strong> {profile.name}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Email:</strong> {profile.email}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Skills:</strong> {profile.profile?.skills?.join(', ') || 'Not specified'}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Resume:</strong> {profile.resume ? <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">View Resume</a> : 'Not uploaded'}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Applied Jobs Summary</h3>
            <div className="stats-grid">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{appliedJobsSummary.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Applied</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{appliedJobsSummary.shortlisted}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Shortlisted</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{appliedJobsSummary.selected}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Selected</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{appliedJobsSummary.rejected}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Rejected</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Applications</h3>
            <div className="space-y-2">
              {recentApplications.map(app => (
                <div key={app._id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{app.jobId.title}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    app.status === 'selected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Available Job Openings</h3>
            <div className="space-y-3">
              {jobs.slice(0, 5).map(j => (
                <div key={j._id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{j.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{j.location} at {j.companyName}</p>
                  </div>
                  <button
                    onClick={() => handleApplyJob(j._id)}
                    disabled={appliedJobsSummary.appliedIds?.includes(j._id)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      appliedJobsSummary.appliedIds?.includes(j._id)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {appliedJobsSummary.appliedIds?.includes(j._id) ? 'Applied' : 'Apply'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Upcoming Tests</h3>
            <div className="space-y-2">
              {upcomingTests.map(test => (
                <div key={test.testId._id} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <p className="font-medium text-gray-800 dark:text-white">{test.testId.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">for {test.jobTitle}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Deadline: {new Date(test.deadline).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Notifications</h3>
            <div className="space-y-2">
              {notifications.slice(0, 5).map(notif => (
                <div key={notif._id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{notif.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(notif.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Update Profile</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="Enter your phone number"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Education</label>
              <textarea
                placeholder="Enter your education details (one per line)"
                value={profileForm.education.join('\n')}
                onChange={(e) => setProfileForm({...profileForm, education: e.target.value.split('\n')})}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills</label>
              <textarea
                placeholder="Enter your skills (comma separated)"
                value={profileForm.skills.join(', ')}
                onChange={(e) => setProfileForm({...profileForm, skills: e.target.value.split(', ')})}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
              <textarea
                placeholder="Tell us about yourself"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resume</label>
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
        <div className="card">
          <h3>Available Jobs</h3>
          <ul>
            {jobs.map(j => (
              <li key={j._id}>
                <strong>{j.title}</strong> - {j.location} at {j.companyName}
                <input type="file" id={`resume-${j._id}`} accept=".pdf,.doc,.docx" />
                <button
                  onClick={() => handleApplyJob(j._id)}
                  disabled={appliedJobsSummary.appliedIds?.includes(j._id)}
                >
                  {appliedJobsSummary.appliedIds?.includes(j._id) ? 'Applied' : 'Apply'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="card">
          <h3>My Applications</h3>
          <ul>
            {applications.map(app => (
              <li key={app._id}>
                {app.jobId.title} - Status: {app.status} - Score: {app.score}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="card">
          <h3>Test Results</h3>
          <ul>
            {testResults.map(result => (
              <li key={result._id}>
                Test: {result.testId.title} - Score: {result.marksObtained}/{result.totalMarks}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <h3>Notifications</h3>
          <ul>
            {notifications.map(notif => (
              <li key={notif._id}>
                {notif.message} - {new Date(notif.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'take-test' && (
        <div className="card">
          <h3>Take Test</h3>
          {!testStarted ? (
            <div>
              <p>Select a test to start:</p>
              <select onChange={(e) => setCurrentTest(e.target.value)}>
                <option value="">Choose a test</option>
                {applications.filter(app => app.testId).map(app => (
                  <option key={app._id} value={app.testId._id}>
                    {app.testId.title} for {app.jobId.title}
                  </option>
                ))}
              </select>
              <button onClick={async () => {
                if (!currentTest) return alert('Please select a test');
                try {
                  const res = await api.get(`/tests/${currentTest}/start`);
                  setCurrentTest(res.data);
                  setTimeLeft(res.data.durationSec);
                  setTestStarted(true);
                  setTestAnswers({});
                  // Start timer
                  const timer = setInterval(() => {
                    setTimeLeft(prev => {
                      if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmitTest();
                        return 0;
                      }
                      return prev - 1;
                    });
                  }, 1000);
                } catch (err) {
                  alert('Error starting test');
                }
              }}>Start Test</button>
            </div>
          ) : (
            <div>
              <div className="timer">Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
              {currentTest.questions.map((q, idx) => (
                <div key={q._id} className="question">
                  <h4>Question {idx + 1}: {q.qText}</h4>
                  {q.type === 'mcq' ? (
                    q.options.map((opt, optIdx) => (
                      <label key={optIdx}>
                        <input
                          type="radio"
                          name={`q-${q._id}`}
                          value={optIdx}
                          onChange={(e) => setTestAnswers({...testAnswers, [q._id]: { qId: q._id, answer: parseInt(e.target.value) }})}
                        />
                        {opt}
                      </label>
                    ))
                  ) : (
                    <textarea
                      placeholder="Your answer"
                      onChange={(e) => setTestAnswers({...testAnswers, [q._id]: { qId: q._id, answer: e.target.value }})}
                    />
                  )}
                </div>
              ))}
              <button onClick={() => handleSubmitTest()}>Submit Test</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'letters' && (
        <div className="card">
          <h3>Letters</h3>
          <ul>
            {letters.map(letter => (
              <li key={letter._id}>
                {letter.type} - {letter.subject}
                <button onClick={() => handleDownloadLetter(letter._id)}>Download</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  async function handleSubmitTest() {
    try {
      const answers = Object.values(testAnswers);
      await api.post(`/tests/${currentTest._id}/submit`, { answers, startedAt: currentTest.startedAt });
      alert('Test submitted successfully');
      setTestStarted(false);
      setCurrentTest(null);
      setTestAnswers({});
      loadData();
    } catch (err) {
      alert('Error submitting test');
    }
  }
}
