export function OriginalResume() {
  return (
    <div className="flex-1 p-8 bg-bg-hover overflow-y-auto">
      <div className="max-w-3xl mx-auto min-h-[800px] bg-white text-black p-12 shadow-sm rounded">
        {/* Basic mock of a rendered resume for editing */}
        <div className="space-y-6">
          <div className="border-b-2 border-gray-300 pb-4">
            <h1 className="text-3xl font-bold font-serif">Eleanor Vance</h1>
            <p className="text-gray-600 mt-2">Senior Backend Engineer | eleanor@example.com</p>
          </div>
          
          <div className="pt-4 space-y-4">
            <h2 className="text-xl font-bold font-serif text-accent-primary bg-accent-primary/10 inline-block px-2">Professional Summary</h2>
            <p className="leading-relaxed">
              Experienced backend engineer with 6+ years of building scalable microservices.
              Currently focusing on Python and FastAPI. Built systems that handle 10k RPS.
            </p>
          </div>
          
          <div className="pt-4 space-y-4">
            <h2 className="text-xl font-bold font-serif">Experience</h2>
            <div>
              <h3 className="font-bold">TechNova Inc — Backend Engineer</h3>
              <p className="text-sm text-gray-500 mb-2">2020 - Present</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Designed and deployed Python microservices.</li>
                <li className="bg-accent-warning/20">Maintained database infrastructure.</li>
                <li>Mentored junior engineers.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
