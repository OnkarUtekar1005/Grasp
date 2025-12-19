const industries = [
  {
    id: 1,
    name: 'Power & Energy',
    desc: 'Generation & Distribution',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    )
  },
  {
    id: 2,
    name: 'Manufacturing',
    desc: 'Factory Automation',
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
      </svg>
    )
  },
  {
    id: 3,
    name: 'Infrastructure',
    desc: 'Smart Cities & Transport',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
  },
  {
    id: 4,
    name: 'Process Industries',
    desc: 'Oil, Gas & Chemicals',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    )
  }
];

const Industries = () => {
  return (
    <section className="section industries-section" id="about">
      <div className="section-inner">
        <div className="section-label">Applications</div>
        <h2 className="section-title">Industries We Serve</h2>
        <div className="industries-grid">
          {industries.map((industry) => (
            <div key={industry.id} className="industry-item">
              <div className="industry-icon">
                {industry.icon}
              </div>
              <h3 className="industry-name">{industry.name}</h3>
              <p className="industry-desc">{industry.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Industries;
