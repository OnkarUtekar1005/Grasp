import { useState, useEffect, useRef } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const faqs = [
    {
      question: "What types of industrial enclosures do you offer?",
      answer: "We offer a comprehensive range of industrial enclosures including polycarbonate enclosures, ABS enclosures, metal enclosures, junction boxes, terminal boxes, and custom enclosures designed for electrical, electronics, automation, and control systems."
    },
    {
      question: "What IP ratings are available for your enclosures?",
      answer: "Our enclosures are available in various IP ratings ranging from IP54 to IP68. IP65, IP66, and IP67 rated enclosures are our most popular choices for outdoor and harsh environment applications, offering protection against dust and water ingress."
    },
    {
      question: "Do you provide custom enclosure solutions?",
      answer: "Yes, we specialize in custom enclosure solutions tailored to your specific requirements. We can customize dimensions, cutouts, mounting options, colors, and materials. Our engineering team works closely with clients to develop enclosures that meet exact specifications."
    },
    {
      question: "What materials are used in your enclosures?",
      answer: "We use high-quality materials including Polycarbonate (PC), ABS, Polycarbonate+ABS blends, Fiberglass (FRP), and various metals (mild steel, stainless steel, aluminum). Each material is selected based on application requirements for durability and chemical resistance."
    },
    {
      question: "What certifications do your products have?",
      answer: "Our products comply with international standards and carry certifications including UL94 (flammability), IP ratings (ingress protection), IK ratings (impact resistance), and relevant IS/ISO standards. Specific certifications vary by product line."
    },
    {
      question: "What is the typical lead time for orders?",
      answer: "Standard products are typically available within 1-2 weeks from our stock. Custom enclosures and bulk orders may require 3-4 weeks depending on specifications and quantity. Contact our sales team for accurate delivery estimates."
    },
    {
      question: "Do you offer technical support for product selection?",
      answer: "Absolutely! Our technical team provides comprehensive support to help you select the right enclosure for your application. We consider factors like environment, IP requirements, size constraints, and mounting needs to recommend the most suitable solution."
    },
    {
      question: "What are your minimum order quantities?",
      answer: "Minimum order quantities vary by product type. Standard enclosures can be ordered in small quantities, while custom solutions may have higher MOQs. Please contact our sales team for specific MOQ information based on your requirements."
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section-v2" ref={sectionRef}>
      <div className={`faq-inner-v2 ${isVisible ? 'visible' : ''}`}>
        {/* Left Column - Header */}
        <div className="faq-header-v2">
          <span className="faq-label">FAQ</span>
          <h2 className="faq-title-v2">
            Everything You Need to Know About Our{' '}
            <span className="highlight">Enclosures</span>
          </h2>
          <p className="faq-desc-v2">
            Have questions about our industrial enclosures? We've got answers.
            Find everything you need to know about specifications, materials,
            and customization options.
          </p>
        </div>

        {/* Right Column - FAQ List */}
        <div className="faq-list-v2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item-v2 ${openIndex === index ? 'open' : ''} ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <button
                className="faq-question-v2"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span>{faq.question}</span>
                <div className={`faq-chevron ${openIndex === index ? 'rotated' : ''}`}>
                  <svg
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </div>
              </button>
              <div className="faq-answer-v2">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Transition */}
      <div className="faq-gradient"></div>
    </section>
  );
};

export default FAQ;
