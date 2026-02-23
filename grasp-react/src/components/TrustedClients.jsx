import { useEffect, useRef } from 'react';

// Import all client logos
import logo1 from '../assets/logos/1 (2).png';
import logo2 from '../assets/logos/2 (2).png';
import logo3 from '../assets/logos/3.png';
import logo4 from '../assets/logos/4.png';
import logo5 from '../assets/logos/5.png';
import logo6 from '../assets/logos/6.png';
import logo7 from '../assets/logos/7.png';
import logo8 from '../assets/logos/8.png';
import logo9 from '../assets/logos/9.png';
import logo10 from '../assets/logos/10.png';
import logo11 from '../assets/logos/11.png';
import logo12 from '../assets/logos/12.png';
import logo13 from '../assets/logos/13.png';
import logo14 from '../assets/logos/14.png';
import logo15 from '../assets/logos/15.png';

const clients = [
  { id: 1, name: 'Client 1', logo: logo1 },
  { id: 2, name: 'Client 2', logo: logo2 },
  { id: 3, name: 'Client 3', logo: logo3 },
  { id: 4, name: 'Client 4', logo: logo4 },
  { id: 5, name: 'Client 5', logo: logo5 },
  { id: 6, name: 'Client 6', logo: logo6 },
  { id: 7, name: 'Client 7', logo: logo7 },
  { id: 8, name: 'Client 8', logo: logo8 },
  { id: 9, name: 'Client 9', logo: logo9 },
  { id: 10, name: 'Client 10', logo: logo10 },
  { id: 11, name: 'Client 11', logo: logo11 },
  { id: 12, name: 'Client 12', logo: logo12 },
  { id: 13, name: 'Client 13', logo: logo13 },
  { id: 14, name: 'Client 14', logo: logo14 },
  { id: 15, name: 'Client 15', logo: logo15 },
];

const TrustedClients = () => {
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Wait one frame for images to load and layout to settle
    const startTimeout = setTimeout(() => {
      const halfWidth = track.scrollWidth / 2;
      const speed = 0.5; // pixels per frame

      const animate = () => {
        posRef.current -= speed;
        if (Math.abs(posRef.current) >= halfWidth) {
          posRef.current += halfWidth;
        }
        track.style.transform = `translateX(${posRef.current}px)`;
        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(startTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="trusted-clients">
      <div className="trusted-clients-inner">
        <div className="trusted-label">Trusted By Industry Leaders</div>
        <div className="clients-marquee">
          <div className="clients-track" ref={trackRef}>
            {[...clients, ...clients].map((client, index) => (
              <div key={index} className="client-item">
                <img src={client.logo} alt={client.name} className="client-logo" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedClients;
