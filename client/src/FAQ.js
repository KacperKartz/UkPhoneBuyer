import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
export function FAQ() {
    const navigate = useNavigate();

    const goHome = (e) => {
        navigate(`/`)
      }

    return (
        <div className='bg-light'>
            <div className="px-4 py-5 my-5 text-center">
    <h1 className="display-5 fw-bold text-body-emphasis">FAQs</h1>
    <div className="col-lg-6 mx-auto">
      <p className="lead mb-4"></p>
      <div className="faq-item">
            <h2>1. What types of phones do you buy?</h2>
            <p>We buy a wide range of phones, including recent models, older models, and phones from various brands. If you’re unsure whether your phone qualifies, check our list of accepted devices or contact our support team.</p>
        </div>

        <div className="faq-item">
            <h2>2. How do I know how much my phone is worth?</h2>
            <p>You can get an estimate of your phone’s value by using our online valuation tool. Simply enter details about your phone, such as the model, condition, and storage capacity, to receive an instant quote.</p>
        </div>

        <div className="faq-item">
            <h2>3. What condition should my phone be in for you to buy it?</h2>
            <p>We accept phones in various conditions, including working, broken, or damaged. The better the condition, the higher the value. Make sure to provide an accurate description to receive a fair offer.</p>
        </div>

        <div className="faq-item">
            <h2>4. How do I sell my phone to you?</h2>
            <p>To sell your phone, start by using our online valuation tool to get an estimate. Once you accept the offer, follow the instructions to send us your phone. We’ll provide a shipping label and cover the shipping costs.</p>
        </div>

        <div className="faq-item">
            <h2>5. How do I prepare my phone for sale?</h2>
            <p>Before sending your phone, make sure to back up your data, perform a factory reset, and remove any SIM or memory cards. Additionally, clear any personal information and ensure the phone is turned off.</p>
        </div>

        <div className="faq-item">
            <h2>6. How long does the selling process take?</h2>
            <p>After we receive your phone, the inspection process typically takes 1-3 business days. Once the phone is inspected and the offer is confirmed, payment will be processed. The total time from sending your phone to receiving payment can vary but usually takes about 5-7 business days.</p>
        </div>

        <div className="faq-item">
            <h2>7. What payment methods do you offer?</h2>
            <p>We offer several payment options, including bank transfers, PayPal, and store credit. You can choose your preferred method during the checkout process.</p>
        </div>

        <div className="faq-item">
            <h2>8. Do you cover the shipping costs?</h2>
            <p>Yes, we provide a prepaid shipping label for you to send your phone to us at no cost. Simply print the label, pack your phone securely, and drop it off at the designated shipping carrier.</p>
        </div>

        <div className="faq-item">
            <h2>9. What if my phone arrives damaged or does not match the description?</h2>
            <p>If your phone arrives damaged or does not match the description provided, we will contact you to discuss the issue. You may be offered a revised value, or the option to have your phone returned to you.</p>
        </div>

        <div className="faq-item">
            <h2>10. How can I contact customer support?</h2>
            <p>You can reach our customer support team via email, phone, or live chat. Visit our Contact Us page for more details and to find the best method to get in touch.</p>
        </div>

        <div className="faq-item">
            <h2>11. What should I do if I haven't received my payment?</h2>
            <p>If you haven't received your payment within the expected time frame, please contact our support team with your transaction details. We will investigate the issue and ensure that your payment is processed promptly.</p>
        </div>

        <div className="faq-item">
            <h2>12. Can I track the status of my phone once it's sent?</h2>
            <p>Yes, once you send your phone using our prepaid shipping label, you can track its status through the shipping carrier’s website. We will also provide updates on the inspection and payment process.</p>
        </div>
      <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
        <button type="button" className="btn btn-primary btn-lg px-4 gap-3" onClick={goHome}>Home</button>
        <button type="button" className="btn btn-outline-secondary btn-lg px-4">Secondary</button>
      </div>
    </div>
     </div>
        </div>
    );
}

export default FAQ;
