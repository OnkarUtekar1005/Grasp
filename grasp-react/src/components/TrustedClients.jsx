const clients = [
  { id: 1, name: 'Tata Power' },
  { id: 2, name: 'L&T' },
  { id: 3, name: 'Siemens' },
  { id: 4, name: 'ABB' },
  { id: 5, name: 'Schneider' },
  { id: 6, name: 'BHEL' },
  { id: 7, name: 'Adani' },
  { id: 8, name: 'Reliance' }
];

const TrustedClients = () => {
  return (
    <section className="trusted-clients">
      <div className="trusted-clients-inner">
        <div className="trusted-label">Trusted By Industry Leaders</div>
        <div className="clients-marquee">
          <div className="clients-track">
            {[...clients, ...clients].map((client, index) => (
              <div key={index} className="client-item">
                <span className="client-name">{client.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedClients;
