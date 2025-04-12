import React, { forwardRef } from 'react';
import { Container } from 'react-bootstrap';

const Certification = forwardRef(({ resident }, ref) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Container ref={ref} className="certification p-4 p-md-5" style={{ maxWidth: '800px', border: '2px solid #0d6efd', borderRadius: '10px' }}>
      {/* Header with official seal placement */}
      <div className="text-center mb-4 position-relative">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div style={{ 
            width: '80px', 
            height: '80px', 
            border: '2px solid #0d6efd', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '20px'
          }}>
            <span className="text-muted">SEAL</span>
          </div>
          <div>
            <h2 className="mb-1" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Republic of the Philippines</h2>
            <h4 className="mb-1" style={{ fontSize: '1.1rem' }}>Province of Lanao del Norte</h4>
            <h4 className="mb-1" style={{ fontSize: '1.1rem' }}>City of Iligan</h4>
            <h4 className="mb-1" style={{ fontSize: '1.1rem' }}>Barangay Del Carmen</h4>
            <h5 className="mt-2" style={{ fontSize: '1rem', fontWeight: 'bold' }}>OFFICE OF THE BARANGAY CAPTAIN</h5>
          </div>
        </div>
      </div>

      {/* Certificate title */}
      <div className="text-center mb-4">
        <h3 className="mb-4" style={{ 
          fontSize: '1.8rem', 
          fontWeight: 'bold',
          textDecoration: 'underline',
          color: '#0d6efd'
        }}>CERTIFICATE OF INDIGENCY</h3>
      </div>

      {/* Certificate content */}
      <div className="mb-4" style={{ lineHeight: '1.8' }}>
        <p style={{ textIndent: '40px' }}>To whom it may concern:</p>
        <p className="mb-4" style={{ textIndent: '40px' }}>
          This is to certify that <strong style={{ textDecoration: 'underline' }}>{resident?.firstname} {resident?.middlename} {resident?.lastname}</strong>, 
          of legal age, residing at <strong style={{ textDecoration: 'underline' }}>{resident?.houseNumber} {resident?.purok}</strong>, 
          Barangay Del Carmen, Iligan City, is a bonafide resident of this barangay.
        </p>
        <p className="mb-4" style={{ textIndent: '40px' }}>
          Based on the records of this barangay, the person is classified as an indigent resident.
        </p>
        <p className="mb-4" style={{ textIndent: '40px' }}>
          This certification is issued upon request for whatever legal purpose it may serve.
        </p>
      </div>

      {/* Footer with date and signature */}
      <div className="mt-5">
        <p className="mb-4">Issued this {currentDate} at Barangay Del Carmen, Iligan City.</p>
        
        <div className="text-end me-5">
          <div className="mb-1">
            <h5 style={{ 
              borderTop: '1px solid #000',
              paddingTop: '10px',
              width: '250px',
              display: 'inline-block'
            }}></h5>
          </div>
          <div>
            <h5 style={{ fontWeight: 'bold', marginBottom: '0' }}>PABLITO S. ABRAGAN JR</h5>
            <p style={{ marginTop: '0' }}>Barangay Captain</p>
          </div>
        </div>
      </div>

      {/* Optional watermark */}
      <div style={{
        position: 'absolute',
        opacity: '0.1',
        fontSize: '80px',
        fontWeight: 'bold',
        color: '#0d6efd',
        transform: 'rotate(-30deg)',
        left: '20%',
        top: '40%',
        zIndex: '-1'
      }}>
        CERTIFICATE
      </div>
    </Container>
  );
});

export default Certification;