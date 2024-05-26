import React, { useEffect } from "react";
import "./contactPage.scss";

function ContactPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static-bundles.visme.co/forms/vismeforms-embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="visme_d" 
         data-title="Untitled Project" 
         data-url="319r9z81-untitled-project" 
         data-domain="forms" 
         data-full-page="false" 
         data-min-height="700px" 
         data-form-id="68976">
    </div>
  );
}

export default ContactPage;
