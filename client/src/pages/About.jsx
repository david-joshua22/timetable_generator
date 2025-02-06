import { useEffect, useState } from "react";
import "../styles/About.css";

const About = () => {
  const [visibleSections, setVisibleSections] = useState({
    about: false,
    moreInfo: false,
    contact: false,
  });

  useEffect(() => {
    const options = {
      threshold: 0.5, // Trigger when 50% of the element is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = entry.target.dataset.section;
          setVisibleSections((prev) => ({ ...prev, [section]: true }));
        }
      });
    }, options);

    const sections = document.querySelectorAll(".fade-in-section");
    sections.forEach((section) => observer.observe(section));

    // Cleanup observer
    return () => observer.disconnect();
  }, []);

  return (
    <div className="background-img">
      <div
        className={`about-information fade-in-section ${
          visibleSections.about ? "visible" : ""
        }`}
        data-section="about"
      >
        <h3>About Us</h3>
        <p>
          This is Batch 12A with a timetable portal helpful for the faculty as
          well as the students.
        </p>
      </div>

      <div
        className={`more-information fade-in-section ${
          visibleSections.moreInfo ? "visible" : ""
        }`}
        data-section="moreInfo"
      >
        <h3>More Information</h3>
        <p>
          Curated to fulfill the needs of the Faculty and Students of MVGR
          College of Engineering.
        </p>
      </div>

      <div
        className={`contact-information fade-in-section ${
          visibleSections.contact ? "visible" : ""
        }`}
        data-section="contact"
      >
        <h3>Contact Us</h3>
        <p>
          Contact us @ <a href="mailto:doc@mvgrce.edu.in">doc@mvgrce.edu.in</a>
          <br />
          Alternate email - <a href="mailto:dsk@gmail.com">dsk@gmail.com</a>
        </p>
      </div>
    </div>
  );
};

export default About;