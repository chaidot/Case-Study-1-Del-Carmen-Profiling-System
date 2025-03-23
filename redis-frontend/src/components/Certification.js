import React, { forwardRef } from 'react';
import { Container } from 'react-bootstrap';

const Certification = forwardRef(({ resident }, ref) => {
  console.log(resident)
  return (
    <>
    <Container ref={ref} className="certification p-5">
      <h2 className="text-center">Republic of the Philippines</h2>
      <h4 className="text-center">Barangay XYZ</h4>
      <h5 className="text-center">Certificate of Indigency</h5>
      <p>To whom it may concern,</p>
      <p>
        This is to certify that <strong>{resident?.firstname && resident?.lastname ? `${resident.firstname} ${resident.lastname}`: "N/A"}</strong>
, of legal age, residing at 
        <strong> {resident.purok} </strong>, is a bonafide resident of Barangay Tambacan. 
        Based on the records of this barangay, the person is classified as an indigent resident.
      </p>
      <p>This certification is issued upon request for whatever legal purpose it may serve.</p>
      <br />
      <p>Issued this {new Date().toLocaleDateString()} at Barangay Tambacan.</p>
      <br />
      <div className="text-end">
        <h5>_________________________</h5>
        <h6>Barangay Captain</h6>
      </div>
    </Container>
    </>
  );
});

export default Certification;