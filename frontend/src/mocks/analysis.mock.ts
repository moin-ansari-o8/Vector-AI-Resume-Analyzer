export const mockAnalysisDetails = {
  scoreBreakdown: {
    overall: 86,
    skills: 90,
    experience: 80,
    education: 100,
  },
  skillSignals: [
    { skill: 'Python', type: 'strong', context: 'Used heavily in last 2 roles (5+ years)' },
    { skill: 'FastAPI', type: 'strong', context: 'Built microservices architecture at current company' },
    { skill: 'AWS', type: 'missing', context: 'Candidate has GCP experience, but job requires AWS' },
  ],
  explainability: "The candidate is a very strong match for this Backend Engineer role. They possess 4 out of 5 required core technologies, with deep, demonstrated experience in Python and FastAPI. While they lack direct AWS experience, their background in Docker and Kubernetes suggests they could onboard to AWS quickly."
};
