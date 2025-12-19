const certifications = [
  {
    id: 1,
    name: 'ISO 9001:2015',
    desc: 'Quality Management',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
  {
    id: 2,
    name: 'IEC 62208',
    desc: 'Enclosure Standard',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  },
  {
    id: 3,
    name: 'IP65-IP68',
    desc: 'Ingress Protection',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    )
  },
  {
    id: 4,
    name: 'BIS Certified',
    desc: 'Indian Standards',
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    )
  },
  {
    id: 5,
    name: 'RoHS',
    desc: 'Environmental',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
      </svg>
    )
  }
];

const Certifications = () => {
  return (
    <section className="section certifications-section" id="certifications">
      {/* Floating Orbs Background Animation */}
      <div className="floating-orb floating-orb-1"></div>
      <div className="floating-orb floating-orb-2"></div>
      <div className="floating-orb floating-orb-3"></div>

      {/* Animated Grid Background */}
      <div className="grid-system">
        <div className="grid-lines"></div>
      </div>

      {/* Animated Drawing Lines */}
      <div className="animated-lines">
        <svg viewBox="0 0 1920 600" preserveAspectRatio="xMidYMid slice">
          <path className="draw-line" d="M0,100 Q480,80 960,100 T1920,100" />
          <path className="draw-line draw-line-alt" d="M0,300 Q480,350 960,300 T1920,300" />
          <path className="draw-line draw-line-alt2" d="M0,500 Q480,450 960,500 T1920,500" />
          <path className="draw-line" d="M960,0 Q900,200 960,400 T960,600" />
        </svg>
        <div className="animated-dot" style={{top: '15%', left: '20%'}}></div>
        <div className="animated-dot" style={{top: '50%', left: '50%'}}></div>
        <div className="animated-dot" style={{top: '80%', left: '75%'}}></div>
      </div>

      <div className="section-inner">
        <div className="section-label">Quality Assurance</div>
        <h2 className="section-title">Certifications & Standards</h2>
        <p className="section-desc">
          Products manufactured to international quality and safety standards.
        </p>
        <div className="certs-grid">
          {certifications.map((cert) => (
            <div key={cert.id} className="cert-item">
              <div className="cert-icon">
                {cert.icon}
              </div>
              <div className="cert-name">{cert.name}</div>
              <div className="cert-desc">{cert.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
