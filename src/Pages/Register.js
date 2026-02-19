import React, { useState, useRef } from "react";
import {
  FiUpload,
  FiX,
  FiMapPin,
  FiMail,
  FiPhone,
  FiDollarSign,
  FiStar,
  FiNavigation,
  FiLock,
  FiFileText,
  FiDownload,
  FiPercent,
  FiHome,
  FiMap,
  FiUser,
  FiClipboard,
  FiFile,
  FiImage,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { 
  MdRestaurant, 
  MdLocationOn, 
  MdDescription,
  MdPhone,
  MdEmail,
  MdAttachMoney,
  MdDiscount,
  MdBusiness,
  MdSecurity,
  MdAssignment
} from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const AddVendorForm = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    restaurantName: "",
    description: "",
    locationName: "",
    email: "",
    mobile: "",
    gstNumber: "",
    referralCode: "",
    password: "",
    lat: "",
    lng: "",
    commission: "",
    discount: ""
  });

  const [files, setFiles] = useState({
    image: null,
    gstCertificate: null,
    fssaiLicense: null,
    panCard: null,
    aadharCardFront: null,
    aadharCardBack: null
  });

  const [previews, setPreviews] = useState({
    image: null,
    gstCertificate: null,
    fssaiLicense: null,
    panCard: null,
    aadharCardFront: null,
    aadharCardBack: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFileSize, setTotalFileSize] = useState(0);

  const fileRefs = {
    image: useRef(null),
    gstCertificate: useRef(null),
    fssaiLicense: useRef(null),
    panCard: useRef(null),
    aadharCardFront: useRef(null),
    aadharCardBack: useRef(null)
  };

  // File size calculation
  const calculateTotalSize = (filesObj) => {
    let total = 0;
    Object.values(filesObj).forEach(file => {
      if (file) total += file.size;
    });
    return total;
  };

  // Image compression function
  const compressImage = async (file, maxWidth = 1024, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
      };
    });
  };

  // Generate Declaration PDF
  const generateDeclarationPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(46, 125, 50);
    doc.rect(0, 0, 210, 30, 'F');
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DECLARATION LETTER', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('(Pure Vegetarian Restaurant)', 105, 22, { align: 'center' });
    
    // Content
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const content = [
      'Date: ___________________________',
      '',
      'To,',
      'Vegiffy - Pure Vegetarian Food Delivery App',
      'Jainity Eats India Private Limited',
      '',
      'Subject: Declaration of Pure Vegetarian Restaurant',
      '',
      'I, ________________________________________, Proprietor / Authorized Signatory of',
      '',
      `Restaurant Name: ${form.restaurantName || '___________________________'}`,
      `Address: ${form.locationName || '___________________________'}`,
      '',
      'do hereby solemnly declare and affirm that:',
      '',
      '1. Our restaurant is a 100% Pure Vegetarian establishment.',
      '2. We do not prepare, store, sell, or serve any non-vegetarian food items.',
      '3. All ingredients and food preparation processes follow pure vegetarian standards.',
      '4. We comply with FSSAI regulations and maintain proper hygiene standards.',
      '5. We understand any violation may lead to immediate delisting from Vegiffy.',
      '',
      'This declaration is made for the purpose of onboarding with Vegiffy platform.',
      '',
      'Vendor Signature: _________________________',
      'Name: _________________________',
      'Mobile: _________________________',
      'Date: _________________________'
    ];

    let yPosition = 40;
    content.forEach(line => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 7;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by Vegiffy Platform', 105, 285, { align: 'center' });

    doc.save('Vegiffy-Declaration.pdf');
  };

  // Generate Vendor Agreement PDF
  const generateVendorAgreementPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(46, 125, 50);
    doc.rect(0, 0, 210, 30, 'F');
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('VENDOR AGREEMENT', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Vegiffy - Pure Vegetarian Food Delivery Platform', 105, 22, { align: 'center' });
    
    // Content
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const agreementContent = [
  'JAINITY EATS INDIA PRIVATE LIMITED',
  '781 SADAR BAZAR BOLARUM SECUNDERABAD TELANGANA 500010',
  'Email id: vendor@Vegiffy.com',
  'Website: www.Vegiffy.com',
  'Phone no: 9391973675',
  'Helpline: 9391950503',
  '',
  'RESTAURANT PARTNER AGREEMENT',
  '',
  'This Restaurant Partner Agreement (hereinafter "Agreement") is hereby entered into as of this the [.] day of [.], 201[.] ("Effective Date") ',
  '',
  'BY AND BETWEEN',
  '',
  'JAINITY EATS INDIA PRIVATE LIMITED, a private limited company incorporated under the Companies Act, 2013, having its registered office at 781, Sadar Bazar, Bolarum, Secunderabad, Telangana – 500010 (the "Company", which term shall include its parent and subsidiary companies and permitted assigns);',
  'AND',
  '',
  `……………, a restaurant duly owned and operated by ……………, having its principal place of business at ${form.locationName || '……………'}, bearing GSTIN: …………… (the "Restaurant Partner", which term shall, unless repugnant to the context, include its successors and permitted assigns).`,
  'The Company and Restaurant Partner are hereinafter collectively referred to as the "Parties" and individually referred to as the "Party".',
  '',
  'WHEREAS, Vegiffy is a technology-driven platform engaged in operating an online marketplace and mobile application that facilitates discovery, listing, ordering, and payment, for exclusively vegetarian food and beverage services, enabling customers to place orders with participating restaurants;',
  'WHEREAS, The Restaurant Partner is lawfully engaged in the business of preparing and selling vegetarian food and beverage items and is desirous of listing its menu and offering its Restaurant Services to customers through the Vegiffy Platform;',
  'WHEREAS, Vegiffy agrees to provide the Restaurant Partner with access to its Platform and related Services, including order facilitation, payment mechanisms, are subject to this Agreement;',
  'WHEREAS, The Restaurant Partner agrees to comply with all applicable laws, including food safety, taxation, consumer protection, and data protection laws, and to perform its obligations in accordance with this Agreement;',
  'WHEREAS, The Parties intend that this Agreement constitutes a principal-to-principal contractual arrangement, and nothing herein shall be construed to create an employment relationship, agency, partnership, joint venture, or franchise between the Parties;',
  'NOW, THEREFORE, in consideration of the mutual covenants and promises contained herein, the Parties agree as follows:',
  '',
  '1. DEFINITIONS',
  'Unless the context otherwise requires, the following terms shall have the meanings assigned to them below:',
  '1. "Agreement" means this Restaurant Partner Agreement, together with the Form, schedules, annexures, policies, and any amendments made from time to time.',
  '2. "Applicable Law" means all central, state, and local laws, statutes, ordinances, rules, regulations, notifications, guidelines, directions, and orders of any governmental authority applicable in India, including but not limited to the Food Safety and Standards Act, 2006, Central Goods and Services Tax Act, 2017, Consumer Protection Act, 2019, Information Technology Act, 2000, and rules made thereunder.',
  '3. "App" or "Platform" means the Vegiffy mobile application, website, web dashboard, APIs, and any other digital interfaces owned, operated, or controlled by Vegiffy through which Customers place Orders.',
  '4. "Content" means all information, data, text, images, logos, trademarks, menus, food photographs, descriptions, pricing, branding material, and other content provided or uploaded by the Restaurant Partner to Vegiffy for listing or display on the Platform.',
  '5. "Customer" means any end user who accesses the Platform and places an Order for Restaurant Services.',
  '6. "Customer Data" means all personal and transactional information relating to a Customer, including name, contact details, address, order details, payment information (excluding sensitive banking credentials), and any other data shared with the Restaurant Partner through the Platform.',
  '7. "Restaurant Partner" means any individual, sole proprietorship, partnership, limited liability partnership, or company that owns, operates, or manages a restaurant or food outlet lawfully engaged in the preparation and sale of vegetarian food and beverage items, and that has entered into this Agreement with Vegiffy for the purpose of listing its menu and offering Restaurant Services to Customers through the Vegiffy Platform.',
  '8. "Execution Date" means the date on which this Agreement is executed by the Parties, as specified in the Form.',
  '9. "Order" means a request placed by a Customer through the Platform for the purchase of Restaurant Services from the Restaurant Partner.',
  '10. "Order Value" means the total amount payable by the Customer for an Order, inclusive of food and beverage prices, packaging charges, applicable taxes, and delivery charges (if any).',
  '11. "Payment Mechanism Fee" means the fee charged by Vegiffy to the Restaurant Partner for facilitating electronic payment transactions through the Platform, as specified in the Form.',
  '12. "Problem Order" means an Order in respect of which a refund, cancellation, or customer complaint arises due to issues attributable to the Restaurant Partner, including quality defects, delays, incorrect items, or non-compliance with instructions.',
  '13. "Restaurant" means the physical premises from which the Restaurant Partner prepares and supplies vegetarian food and beverage items.',
  '14. "Restaurant Partner" means the individual, proprietorship, partnership, LLP, or company that has executed this Agreement with Vegiffy to offer Restaurant Services through the Platform.',
  '15. "Restaurant Services" means the preparation and sale of vegetarian food and beverage items by the Restaurant Partner to Customers through the Platform.',
  `16. "Service Fee" means the commission or fee payable by the Restaurant Partner to Vegiffy for use of the Platform and Services, as specified in the Form.${form.commission ? ` (${form.commission}% commission on all orders)` : ''}`,
  '17. "Services" means the services provided by Vegiffy under this Agreement, including Platform access, order facilitation, and payment processing.',
  '18. "Vegiffy or Company" means Vegiffy and its present or future holding companies, subsidiaries, affiliates, successors, and assigns.',
  '19. "Vegetarian Food" means food and beverage items that do not contain meat, fish, poultry, eggs, or any animal-derived ingredients, in accordance with Vegiffy\'s vegetarian-only platform policy.',
  '',
  '1. SCOPE OF WORK',
  'a. Vegiffy shall provide the Restaurant Partner with access to the Vegiffy Platform for the purpose of listing the Restaurant, displaying its vegetarian menu, prices, images, descriptions, operating hours, and other relevant information, and enabling Customers to place Orders for Restaurant Services.',
  'b. Vegiffy shall facilitate the placement and transmission of Orders from Customers to the Restaurant Partner through the Platform, Merchant Application, web dashboard, API integration, or other communication modes as specified under this Agreement.',
  'c. Vegiffy shall enable Customers to make payments for Orders through permitted payment mechanisms, including cash-on-delivery, electronic payment modes, vouchers, or discount coupons (where applicable), and shall settle the Order Value with the Restaurant Partner in accordance with the agreed settlement terms, after applicable deductions.',
  'd. Vegiffy shall provide the Restaurant Partner with access to technological tools, including the App, web dashboard, APIs, and, where applicable, to enable efficient Order management, reporting, and operational support.',
  'e. Vegiffy shall act as a facilitation point for receiving Customer complaints relating to the Platform, payment processing, and Order placement, and shall route complaints relating to Restaurant Services to the Restaurant Partner for resolution in accordance with applicable laws and timelines.',
  'f. Vegiffy shall facilitate statutory compliance relating to invoicing, tax collection (where applicable under law), reporting, and settlement in accordance with Applicable Laws, including GST and e-commerce regulations.',
  'g. The Parties expressly agree that the scope of work under this Agreement is on a principal-to-principal basis. Nothing contained herein shall be construed as creating any employment, agency, partnership, joint venture, or franchise relationship between Vegiffy and the Restaurant Partner.',
  '',
  '2. OBLIGATIONS OF Vegiffy',
  'a. Vegiffy shall',
  'i. list the Restaurant Partner\'s menu and price list on the Platform; and',
  'ii. transfer to the Restaurant Partner the amounts received from the Customers in accordance with the agreed terms set out herein.',
  'b. Vegiffy shall display on the Platform, on a best-effort basis, all necessary information provided by the Restaurant Partner. However, Vegiffy shall not be under any obligation to display any information until the Restaurant Partner provides all required information and such information is in compliance with Vegiffy\'s policies and guidelines.',
  'c. Vegiffy reserves the right to temporarily restrict or deactivate the Restaurant Partner\'s Food Ordering and Delivery Services to avoid any Customer complaints. The Restaurant Partner\'s access shall be reinstated upon a specific request made to Vegiffy\'s customer support centre. Vegiffy further reserves the right to cancel any Order where the Restaurant Partner is unable to communicate its response within two (2) minutes with respect to (a) acceptance or rejection of the Customer Order; and/or (b) Order delivery timelines; or',
  'd. Vegiffy shall redress the complaints of Customers and the Restaurant Partner in respect of the functioning of the Platform and/or the Tablet or Vegiffy Device (as applicable).',
  'e. For the avoidance of doubt, it is hereby expressly clarified that Vegiffy is only responsible for providing a Platform to the Restaurant Partner to list, offer, and sell the Restaurant Services to the Customers and that Vegiffy shall not be responsible or liable for the quality of the Restaurant Services listed on the Platform and/or the processing of the Orders placed by Customers with the Restaurant Partner on the Platform; and/or any delay in preparation of the Order by the Restaurant Partner.',
  'f. Vegiffy may suspend the Restaurant Partner\'s account if the Restaurant Partner is found to be non-compliant with the Food Safety and Standards Act, 2006, and the rules, regulations, licences, standards, and guidelines issued thereunder from time to time.',
  '',
  '3. OBLIGATIONS OF THE RESTAURANT PARTNER',
  'a. The Restaurant Partner shall not discriminate while servicing Orders received from Customers ordering via the App. The Restaurant Partner shall not provide any preferential treatment to customers ordering independently from the Restaurant Partner (i.e., customers ordering directly from the Restaurant Partner).',
  'b. The Restaurant Partner shall respect the dignity and diversity of Delivery Partners and accordingly shall not discriminate against any Delivery Partner on the basis of Discrimination Characteristics (as defined below). The Restaurant Partner is expected to enable the provision of a secure and fearless gig work environment for the Delivery Partners, including prevention and deterrence of harassment (including sexual harassment) towards Delivery Partners. For the purpose of these Terms, "Discrimination Characteristics" shall mean discrimination based on race, community, religion, disability, gender, sexual orientation, gender identity, age (insofar as permitted by applicable laws to undertake the relevant gig work), genetic information, or any other legally protected status.',
  'c. The Restaurant Partner shall ensure that all mandatory information pertaining to taxes, levies, and charges applicable on the Order(s) are clearly visible to the Customers on the invoice issued for any supply other than Restaurant Services, as per applicable laws. For the sake of clarity, in the case of Restaurant Services, Vegiffy shall generate the tax invoice on behalf of the Restaurant Partner in accordance with applicable GST laws and deposit the tax with the appropriate tax authorities.',
  'd. The Restaurant Partner shall ensure that the information provided to Vegiffy is current and accurate, including but not limited to the Restaurant Partner\'s name, address, contact telephone number, email address, manager/contact person details, delivery times, opening hours, menu(s), price lists, taxes, menu item categorisation, service addresses, and other relevant information.',
  'e. The Restaurant Partner shall confirm to Vegiffy its menu item categorisation between Restaurant Services and supply of Vegetarian food and beverage items. The menu item categorisation as confirmed by the Restaurant Partner shall be relied upon by Vegiffy for the purpose of undertaking necessary compliance with applicable laws. In the event of any dispute relating to menu item categorisation, the Restaurant Partner undertakes to indemnify and make good any losses incurred by Vegiffy on account of any mis-declaration or mis-representation of facts.',
  'f. The Restaurant Partner shall ensure that it is the sole author/owner of, or otherwise controls, all content/material including but not limited to the Restaurant Partner\'s name, establishment name, logo, menu items, images of food and beverages/menu items, etc., transmitted or submitted by the Restaurant Partner to Vegiffy.',
  'g. The Restaurant Partner shall process and execute the Order(s) promptly.',
  'h. The Restaurant Partner shall be obligated to turn off the "Accepting Delivery" feature on its food ordering mechanism whenever the Restaurant Partner is unable to provide Restaurant Services to Customers.',
  'i. The Restaurant Partner acknowledges and agrees that, in the event the Customer\'s experience with the Restaurant Partner and the Restaurant Services is adversely affected due to acts or omissions attributable to the Restaurant Partner, including but not limited to frequent rejection of Order(s), Vegiffy reserves the right to take appropriate action in accordance with its policies, as amended from time to time.',
  'j. The Restaurant Partner shall inform Vegiffy about any change or modification made to an Order by a Customer directly with the Restaurant Partner.',
  'k. The Restaurant Partner hereby agrees that if it accepts an Order cancellation request raised by a Customer via the App, it shall not be eligible to receive any Order value or amount for such cancelled Order.',
  'l. The Restaurant Partner shall retain proof of delivery for a period of 180 (one hundred and eighty) days from the date of delivery.',
  'm. The Restaurant Partner warrants that the food and beverages provided to Customers are',
  'i. of high quality and fit for human consumption; compliant with the Food Safety and Standards Act, 2006, and the rules, regulations,',
  'ii. licences, standards, and guidelines issued thereunder;',
  'iii. and compliant with all other applicable Indian laws, including food industry regulations.',
  'n. The Restaurant Partner shall contact the Customer if an Order cannot be processed as requested or to clarify Order details, if required, after confirmation of the Order.',
  'o. The Restaurant Partner shall promptly redress Customer complaints referred by Vegiffy relating to:',
  'i. quality, quantity, and/or taste of vegetarian food and beverages; delivery of Orders where delivery is undertaken by the Restaurant Partner and issues are attributable to the Restaurant Partner;',
  'ii. and failure to comply with special requests or instructions clearly communicated by the Customer at the time of placing the Order.',
  'p. The Restaurant Partner shall remove any and all menu items that are unavailable.',
  'q. For avoidance of doubt, Vegiffy shall not be responsible or liable to Customers for:',
  'i. quality of the Restaurant Services advertised on the Platform;',
  'ii. processing of Orders;',
  'iii. misconduct or illegal activity of Delivery Partners.',
  'r. The Restaurant Partner shall ensure that Orders are in accordance with the Customer\'s Order and appropriately packed and securely fastened to avoid spillage during transit, considering the delivery duration.',
  's. The Restaurant Partner shall:',
  'i. make timely payment of statutory dues; and',
  'ii. maintain adequate insurance.',
  't. While making deliveries, the Restaurant Partner shall not commingle Orders placed through the Platform with Orders received directly or through third parties. Orders shall be packed using Vegiffy-provided packaging or other neutral packaging, provided that no third-party branding is used under any circumstances.',
  'u. The Restaurant Partner shall expeditiously address and resolve all Customer complaints received by Vegiffy within timelines prescribed by the Ministry of Consumer Affairs or other competent authorities. The Restaurant Partner shall be solely liable for action on such complaints.',
  'v. The Restaurant Partner acknowledges and agrees that it shall furnish PAN, TAN, GSTIN, FSSAI licence, registration certificates, and other details as required by law or for provision of Services, as requisitioned by Vegiffy from time to time, failing which Vegiffy reserves the right to delist or restrict access to the Platform.',
  'w. The Restaurant Partner shall comply with applicable laws banning single-use plastic and ensure that neither single-use plastic packaging nor plastic cutlery is used. Vegiffy reserves the right to cancel Orders packed using single-use plastic, and any payments made to Delivery Partners or refunds/compensation to Customers shall be recovered from the Restaurant Partner in accordance with Vegiffy\'s cancellation policy. Any loss suffered by Vegiffy or Delivery Partners due to such violations shall be recovered through deductions as per the agreed settlement process.',
  'x. The Restaurant Partner shall ensure that Orders are ready when the Delivery Partner arrives. Failure to hand over Orders within indicated preparation time shall render the Restaurant Partner liable for all associated costs, including Customer reimbursements.',
  'y. The Restaurant Partner shall not independently contact Customers to demand payment exceeding the amount agreed at the time of Order placement on the Platform.',
  'z. Except as required for fulfilment of Orders, the Restaurant Partner shall not use Customer data for sending unsolicited marketing communications or announcements.',
  'aa. The Restaurant Partner shall not engage in fraudulent activities or misuse benefits extended by Vegiffy to Customers and shall be liable to Vegiffy upon discovery of any such activity.',
  'bb. The Restaurant Partner shall not charge delivery fees or payment mechanism fees to Customers where the Restaurant Partner is not undertaking delivery.',
  'cc. The Restaurant Partner shall protect and maintain Customer experience on the Platform by accurately displaying Restaurant details, including item names and images.',
  'dd. The Restaurant Partner shall not charge Customers for anything other than food, beverages, and packaging charges. All menu items available for delivery through the Restaurant Partner\'s own channels or other platforms shall also be made available through the Platform.',
  'ee. The Restaurant Partner acknowledges that having similar item names and images across multiple Restaurant listings operating from the same location may cause Customer confusion and adversely affect Platform experience.',
  'ff. In the event any Restaurant listings are found to be in violation of this Clause jj, Vegiffy shall notify the Restaurant Partner with a 30 (thirty) day written notice to make necessary corrections. Failure to do so shall entitle Vegiffy to take appropriate action, including removal of duplicate listings from the Platform, in accordance with its policies and this Agreement.',
  '',
  '4. RESTAURANT PARTNER MENU AND PRICE LIST',
  'a. Vegiffy shall display on the Platform the menu and price list of all its Restaurant Partners. The Restaurant Partner agrees that Vegiffy reserves the right, at its sole discretion, to modify or delete certain items from the Restaurant Partner\'s menu listed on the Platform in order to ensure compliance with the Food Safety and Standards Act, 2006, applicable laws in the relevant State or Union Territory, and all other applicable legislation, regulations, or regulatory standards. Vegiffy shall endeavour to update the price lists within forty-eight (48) hours of receiving written notification of any changes from the Restaurant Partner. Where the Restaurant Partner has a unilateral right to access the Restaurant Partner admin panel or dashboard (subject to Vegiffy\'s written consent) to edit and update the information displayed on the Platform by Vegiffy, the Restaurant Partner shall ensure that it:',
  'i. keeps such information true, accurate, and updated at all times;',
  'ii. complies with Vegiffy\'s internal terms and conditions of use in this regard; and',
  'iii. intimates Vegiffy of such changes.',
  'b. The Restaurant Partner shall provide Vegiffy with a separate list of all Pre-Packaged Goods forming part of the Restaurant Partner\'s menu to be listed on the Platform, in a format acceptable to Vegiffy.',
  'c. The Restaurant Partner shall ensure that the Pre-Packaged Goods listed on the Platform have a remaining shelf life of at least thirty percent (30%) or forty-five (45) days prior to expiry, at the time of delivery to Customers.',
  'd. The Restaurant Partner shall, at all times, maintain prices for all products offered to Customers through the Platform that are equal to or lower than the prices offered through its direct channels, including dine-in, takeaway, or delivery from its own Restaurant or franchise locations, or other channels such as websites or mobile applications. For the sake of clarity, pricing shall include the prices of food and beverage items as well as packaging charges and any other applicable charges.',
  'e. Where the Restaurant Partner creates special portion sizes for the Platform, as compared to portion sizes offered through its own channels (including dine-in, delivery, or takeaway), the pricing for such menu items on the Platform shall be proportionate to or lower than the pricing on its own channels.',
  'f. In the event the Restaurant Partner fails to maintain pricing in accordance with Clauses d and e above, Vegiffy reserves the right to take appropriate action in accordance with its policies, as amended from time to time.',
  'g. The Restaurant Partner shall not charge any amount in excess of the maximum retail price ("MRP") for food and beverage items where an MRP is mentioned on such items.',
  'h. The Restaurant Partner acknowledges and agrees that Vegiffy shall use its best endeavours to prevent misuse of the Platform by Customers for placement of erroneous or fraudulent Orders. In the event of any erroneous or fraudulent Order, the Restaurant Partner undertakes to promptly report such Order to Vegiffy by contacting Vegiffy for appropriate action and investigation. For this purpose, Vegiffy provides built-in feature(s) within the Merchant Application and web dashboard that enable the Restaurant Partner to report erroneous or fraudulent Orders.',
  'i. The App may be modified or updated from time to time, without prior notice, to reflect any such changes.',
  '',
  '5. PAYMENTS MECHANISM',
  'a. The Restaurant Partner acknowledges and agrees that the Platform shall provide the following payment mechanisms to Customers for payment of the Order Value:',
  'i. Cash on delivery;',
  'ii. Electronic payment mechanisms; and',
  'iii. Redemption of vouchers and/or discount coupons (if any) approved by Vegiffy.',
  'b. The Restaurant Partner acknowledges and agrees that Vegiffy shall provide the Restaurant Partner with a monthly invoice within a period of seven (7) days from the last date of the immediately preceding month for the Service Fee, Payment Mechanism Fee, refund charges, One-Time Sign-Up Fee, and any other amounts or charges payable by the Restaurant Partner to Vegiffy in respect of applicable Orders.',
  'c. All invoices shall be sent to the Restaurant Partner by email. Such invoices shall be issued from the respective registered office of Vegiffy from where the Services are being performed, in order to comply with the applicable Goods and Services Tax (GST) laws in India.',
  'd. The Restaurant Partner acknowledges and agrees that all amounts payable to Vegiffy under this Agreement shall be exclusive of applicable taxes, and that all such applicable taxes shall be charged separately.',
  '',
  '6. OBLIGATIONS OF PARTIES IN CASE OF ONLINE PAYMENT ORDERS',
  'a. The Restaurant Partner shall comply with all of the following requirements upon receipt of an online payment Order:',
  'i. ensure that no additional payment is collected from the Customer (including, without limitation, cash payments) where the Customer has already made payment online;',
  'ii. comply with all special instructions contained on the Order receipt or as communicated by the Service Operator.',
  'b. Where the Restaurant Partner has failed to comply with delivery instructions (as set out in the Order receipt) or has supplied food products of poor quality to the Customer, and Vegiffy is required (pursuant to a Customer complaint) to refund the Order Value to the Customer in any manner hereinafter called as "Problem Order", the Restaurant Partner acknowledges and agrees that it shall not be entitled to receive any payment for such Problem Order. Further, where the Restaurant Partner has already received the Order Value from Vegiffy in respect of such Problem Order (subject to appropriate reductions under Clause 8), Vegiffy shall be entitled, in accordance with this Agreement, to deduct or set off such amount against any monies payable by Vegiffy to the Restaurant Partner in respect of future Orders.',
  'c. The Restaurant Partner shall disclose all relevant details pertaining to Problem Order(s) to Vegiffy, as and when required by Vegiffy.',
  'd. Vegiffy shall promptly communicate with its bank upon becoming aware of any fraud committed by a Customer.',
  '',
  '7. PAYMENT SETTLEMENT PROCESS',
  'a. The Restaurant Partner acknowledges and agrees that any Order Value collected by Vegiffy for and on behalf of the Restaurant Partner in accordance with these Terms shall be remitted to the Restaurant Partner, subject to deduction by Vegiffy of the following amounts, as applicable:',
  'i. Service Fee (for cash-on-delivery Orders and online paid Orders);',
  'ii. Payment Mechanism Fee payable by the Restaurant Partner;',
  'iii. taxes collected by Vegiffy in case of Restaurant Services provided by the Restaurant Partner through the App; and',
  'iv. any other amounts payable to Vegiffy under the Form or for other services availed by the Restaurant Partner from Vegiffy, to which the Restaurant Partner has expressly consented.',
  'b. The Parties acknowledge and agree that after deduction of the aforesaid amounts, Vegiffy shall remit the Order Value payable to the Restaurant Partner on a weekly settlement basis, calculated from the date of receipt of payment by Vegiffy. For weekly settlements, remittance shall be made after allowing reasonable time for adjustments relating to Orders refused by Customers or refunded, in accordance with Reserve Bank of India guidelines for payment systems and nodal accounts ("Payment Settlement Day"). Orders serviced between Monday and Sunday shall be settled on or before Thursday of the following week. If such day is a bank holiday, settlement shall be made on the next working day.',
  'c. Notwithstanding anything contained in this Agreement, the Restaurant Partner hereby irrevocably authorises Vegiffy to set off, withhold, and deduct any amounts owed by the Restaurant Partner or its affiliates to any Vegiffy Group Company under any agreement or arrangement, from the Net Order Value payable to the Restaurant Partner. Such amounts shall be applied toward outstanding dues. For the purposes of this Clause, such deductions shall be deemed to form part of the Service Fee payable to Vegiffy. "Vegiffy Group Company" shall include all present or former direct or indirect subsidiaries, affiliates, or successors of Vegiffy.',
  '',
  '8. CHARGES',
  'a. In consideration of the Services offered by Vegiffy to the Restaurant Partner, the Restaurant Partner undertakes to pay to Vegiffy charges including the Service Fee and Payment Mechanism Fee, at the rates set out in the Form.',
  'b. The Restaurant Partner acknowledges and agrees that where Vegiffy extends additional support services to the Restaurant Partner and/or Customers and incurs corresponding support costs, or where Vegiffy issues refunds to Customers on account of acts or omissions attributable to the Restaurant Partner, including but not limited to frequent rejection or time-out of Order(s), delay in accepting or handing over the Order(s), poor quality food, missing or incorrect items, poor quality packaging, etc., as may be communicated to the Restaurant Partner in periodic reports, Vegiffy reserves the right to levy additional charges solely at it\'s own discretion.',
  'c. For the purpose of this Agreement,',
  'i. Orders requiring support: Orders where support teams extend additional support to mitigate Customer escalations, including but not limited to delay in accepting or handing over the Order(s), poor quality food, missing or incorrect items, poor quality packaging, etc.',
  'ii. Restaurant Partner rejected Orders: Orders that are not accepted (whether due to rejection or inaction resulting in time-out) by the Restaurant Partner, or Orders that are accepted but not fulfilled by the Restaurant Partner.',
  'iii. From time to time, Vegiffy may revise the fees for the Services, including, without limitation, the Service Fee rates, Payment Mechanism Fee, and any other charges or fees, or introduce additional charges or fees, by providing the Restaurant Partner with at least seven (7) days\' prior intimation before such changes or additional charges take effect.',
  '',
  '9. TAXES',
  'a. The Restaurant Partner shall be solely responsible for the computation, collection, payment, filing, and compliance of all applicable taxes, duties, levies, and statutory charges in relation to Customer Orders and the Restaurant Partner\'s use of the Vegiffy Platform and Services, except to the extent expressly required by Applicable Law to be collected or paid by Vegiffy.',
  'b. Where applicable under law, Vegiffy may collect certain taxes from Customers on behalf of the Restaurant Partner. Any such taxes shall be collected by Vegiffy solely in the capacity of a facilitator and shall be remitted to the Restaurant Partner or the appropriate tax authorities, as required under Applicable Law.',
  'c. In accordance with Section 9(5) of the Central Goods and Services Tax Act, 2017, Vegiffy shall collect and deposit applicable GST on specified Restaurant Services supplied through the Platform. Such collection and payment shall be deemed full discharge of Vegiffy\'s tax obligations in this regard.',
  'd. The Restaurant Partner shall be solely responsible for verifying tax amounts, filing all applicable tax returns, reconciling statements, and remitting taxes to the appropriate governmental authorities. Vegiffy shall not be responsible for any errors, mismatches, or non-compliance arising from incorrect or incomplete information provided by the Restaurant Partner.',
  'e. Vegiffy shall collect Tax Collected at Source ("TCS") on applicable transactions at the rates prescribed under GST laws and remit the same to the appropriate tax authorities. The Restaurant Partner shall provide accurate GSTIN details and shall be solely responsible for reconciling such TCS with the statements and returns filed by Vegiffy. Vegiffy shall provide periodic TCS statements for reconciliation purposes.',
  'f. Vegiffy shall deduct Tax Deducted at Source ("TDS") under Section 194-O of the Income Tax Act, 1961 on eligible amounts, at the rates prescribed under Applicable Law, and remit the same to the appropriate tax authorities. The Restaurant Partner shall provide correct PAN details and shall be responsible for reconciling and claiming credit of such TDS based on certificates and transaction statements issued by Vegiffy.',
  'g. Vegiffy shall not be liable for any tax liability arising due to the Restaurant Partner\'s failure to comply with Applicable Law. The Restaurant Partner agrees to indemnify and hold harmless Vegiffy, its affiliates, and their respective directors, officers, employees, and representatives from and against any tax claims, penalties, interest, or losses arising from such non-compliance.',
  'h. Any discrepancy identified by the Restaurant Partner in tax deductions or collections shall be notified to Vegiffy within fifteen (15) days of receipt of the relevant statement or certificate. Vegiffy shall not be obligated to address any discrepancies reported after the statutory timelines prescribed under Applicable Law.',
  '',
  '10. CONFIDENTIALITY',
  'a. Other than for the provision of Service(s) by Vegiffy, Vegiffy shall not share any information of the Restaurant Partner with third parties, unless such disclosure is requisitioned by government authorities.',
  'b. Other than for the purpose of availing Service(s) from Vegiffy, the Restaurant Partner shall not disclose any confidential information relating to Vegiffy, including but not limited to these Terms, Vegiffy\'s business strategies, pricing, revenues, expenses, Customer Data, and Order information, to any third party.',
  'c. The obligations under this Clause shall not apply to the extent that the Delivery Partner is required to disclose Confidential Information:',
  'i. pursuant to any mandatory requirement of Applicable Law, regulation, or order of a competent court or governmental authority, provided that the Delivery Partner, to the extent legally permissible, gives Vegiffy prior written notice of such requirement;',
  'ii. with the prior written consent or express authorisation of Vegiffy; or',
  'iii. to professional advisors (including legal or tax advisors), provided that such advisors are bound by confidentiality obligations no less stringent than those contained herein.',
  'iv. The confidentiality obligations under this Clause shall not apply to any information that is or becomes publicly available through no act or omission of the Delivery Partner or any other person owing an obligation of confidentiality to Vegiffy.',
  'd. The obligations under this Clause shall survive the termination or expiry of this Agreement for any reason whatsoever.',
  '',
  '11. WARRANTY AND INDEMNITY',
  'a. The Restaurant Partner warrants that in the event it ceases to carry on business, closes operations for a material period, or is otherwise unable to offer services to Customers, it shall promptly inform Vegiffy. Where the Restaurant Partner fails to do so, whether by omission or fault, Vegiffy shall not be held responsible for any liabilities, whether financial or otherwise.',
  'b. The Restaurant Partner warrants that it shall not offer for sale any potentially hazardous food, alcoholic beverages, tobacco products, or any other items prohibited under applicable law.',
  'c. Vegiffy warrants that it shall perform its obligations under this Agreement with reasonable skill and care.',
  'd. Vegiffy does not guarantee or warrant that the Platform, Application, software, hardware, or Services shall be free from defects or malfunctions. In the event of any errors, Vegiffy shall use its best endeavours to rectify the same as expeditiously as possible.',
  'e. The Restaurant Partner warrants that it complies, and shall continue to comply, with the Food Safety and Standards Act, 2006, the Legal Metrology Act, 2009, and the rules and regulations framed thereunder, as well as all other applicable laws, regulations, and standards in the relevant State or Union Territory.',
  'f. The Restaurant Partner warrants that it shall obtain and maintain, for the duration of these Terms, all requisite licences and/or registrations and shall provide copies of such licences and/or registrations to Vegiffy prior to availing the Services.',
  'g. The Restaurant Partner agrees to indemnify and hold harmless Vegiffy (including its directors, officers, agents, representatives, and employees) from and against any and all claims, suits, liabilities, judgments, losses, and damages arising out of or in connection with any claim, suit, or demand:',
  'i. made by a Customer (or any person acting on behalf of a Customer), for reasons not attributable to the Services;',
  'ii. made by a Customer (or any person acting on behalf of a Customer) or any third party in respect of, arising out of, or relating to the Content, information, or material provided by the Restaurant Partner to Vegiffy for listing on the Platform;',
  'iii. in respect of, arising out of, or in connection with the Restaurant Services (or any other services actually or purportedly offered in relation thereto) and delivery of such Restaurant Services where delivery is undertaken by the Restaurant Partner;',
  'iv. in respect of or connected with the collection or payment of applicable taxes in any manner connected with these Terms or any goods or services provided hereunder;',
  'v. relating to the quality of the Restaurant Services provided by the Restaurant Partner;',
  'vi. relating to the warranties provided by the Restaurant Partner under this Clause 13 (Warranty and Indemnity);',
  'vii. relating to harm caused by the Restaurant Partner supplying unsafe Restaurant Services, any product failure, defect, or hazard in any Restaurant Services supplied or sold by the Restaurant Partner, or inadequate instructions or warnings provided to Customers in relation thereto;',
  'viii. brought by Vegiffy and/or any third party on account of misuse, abuse, cheating, fraud, or misrepresentation by the Restaurant Partner;',
  'ix. arising out of or in connection with any use of Customer Data not in accordance with this Agreement and/or applicable law;',
  'x. arising from any misleading, incorrect, or false information or data provided by the Restaurant Partner;',
  'h. The Restaurant Partner acknowledges that it grants certain rights to Vegiffy to enable Vegiffy to provide Services to Customers. Vegiffy shall not be liable for any tax liability in respect of the supply of food and beverage items other than Restaurant Services by the Restaurant Partner to Customers, and the Restaurant Partner hereby agrees to indemnify Vegiffy against any such tax liabilities that may arise from such transactions.',
  '',
  '12. CUSTOMER DATA',
  'a. The Restaurant Partner agrees that it shall use the Customer Data solely for fulfilling the applicable Customer Orders and for complying with the Restaurant Partner\'s obligations under this Form. The Restaurant Partner further agrees that Customer Data shall not be used to enhance or supplement any database, file, or list of the Restaurant Partner or of any third party.',
  'b. The Restaurant Partner represents, warrants, and covenants that it shall not resell, broker, or otherwise disclose any Customer Data, whether in whole or in part, to any third party for any purpose whatsoever. The Restaurant Partner further agrees that it shall not use Customer Data for sending any unsolicited marketing messages, announcements, or for feedback purposes, and shall be solely responsible for ensuring that any third party with whom Customer Data is shared complies with the restrictions set forth herein.',
  'c. The Restaurant Partner agrees that it shall not copy or otherwise reproduce any Customer Data except to the extent necessary for fulfilling the applicable Customer Order. The Restaurant Partner (and any other persons to whom the Restaurant Partner provides Customer Data) shall implement and comply with reasonable security measures for protecting, handling, and securing Customer Data.',
  'd. Where any Customer Data is collected by the Restaurant Partner (or on its behalf), the Restaurant Partner shall ensure that it, and any applicable third parties, adopt, publish, and process such Customer Data in accordance with an appropriate and customary privacy policy.',
  'e. For the purposes of this Agreement, the restrictions contained herein regarding the use of Customer Data shall not apply to:',
  'i. data of any Customer who was a customer of the Restaurant Partner prior to the Restaurant Partner\'s use of the Platform or the Vegiffy Services, but only in respect of data previously provided by such Customer to the Restaurant Partner; or',
  'ii. data supplied directly by a Customer to the Restaurant Partner, where such Customer becomes a customer of the Restaurant Partner and has explicitly opted to receive communications from the Restaurant Partner for the purposes for which such Customer Data is used, provided in all cases that the Restaurant Partner handles and uses such Customer Data in compliance with applicable laws and the Restaurant Partner\'s published privacy policy.',
  '',
  '13. TERM AND TERMINATION',
  'a. The arrangement between the Parties shall commence on the Execution Date and, unless terminated earlier in accordance with this Clause, shall continue indefinitely. Either Party may terminate the arrangement, with or without cause, at any time by providing seven (7) days\' prior written notice to the other Party.',
  'b. Vegiffy may terminate the arrangement or suspend the Services of the Restaurant Partner with immediate effect if:',
  'i. the Restaurant Partner fails to conduct its business in accordance with this Agreement or the information provided to Vegiffy, including but not limited to proprietary rights, opening hours, delivery areas, delivery conditions, nature of food served, or pricing;',
  'ii. the user experience in relation to the Restaurant Partner is not found to be satisfactory in accordance with Vegiffy\'s standards;',
  'iii. for a continuous period of fourteen (14) days, the Restaurant Partner fails to deliver Orders that are not fraudulent or unintentional;',
  'iv. any insolvency event occurs, including bankruptcy, appointment of a receiver, administrator, liquidator, winding up, or dissolution;',
  'v. Vegiffy identifies any fraudulent or suspicious activity on the Restaurant Partner\'s account;',
  'vi. the Restaurant Partner fails to comply with applicable law and/or these Terms; and/or',
  'vii. Vegiffy undertakes any investigation to verify the Restaurant Partner\'s compliance with applicable law and/or these Terms.',
  'c. The Parties may terminate the arrangement with immediate effect by written notice if the other Party commits a material breach which, if capable of remedy, is not remedied within fourteen (14) days of receipt of a written notice specifying such breach.',
  'd. Termination of the arrangement shall not affect any accrued rights or liabilities of the Parties as of the date of termination; and not affect the validity of Services already provided to Customers or the Restaurant Partner\'s obligation to pay for Services already availed in accordance with this Agreement.',
  'e. Vegiffy, at its sole discretion, reserves the right to suspend and/or terminate the Services immediately, with prior notice to the Restaurant Partner, in the event of',
  'i. any alleged, threatened, or actual suspicious activity and/or',
  'ii. breach of any intellectual property rights of Vegiffy or any third party by the Restaurant Partner; and/or',
  'iii. false misrepresentation by the Restaurant Partner; and/or fraudulent activity.',
  'f. The Restaurant Partner agrees and acknowledges that, in addition to the right to suspend or terminate the Services, Vegiffy shall also have the right to withhold, set off, and deduct any payments due to the Restaurant Partner from Vegiffy. Solely for the purposes of this Clause, any such amounts withheld, set off, or deducted shall be deemed to form part of the Service Fee payable by the Restaurant Partner to Vegiffy under the Form and these Terms.',
  '',
  '14. NOTICE REQUIREMENTS',
  'a. Any notice, communication, or intimation under this Agreement shall be provided by Vegiffy to the Restaurant Partner through the App, dashboard notifications, email, or any other electronic mode. Such communication shall be deemed to have been validly served upon dispatch.',
  'b. The Restaurant Partner shall ensure that all contact details registered on the Platform are accurate and up to date. Vegiffy shall not be responsible for any failure of communication due to incorrect or outdated contact information.',
  'c. Any factors that prevent the Restaurant Partner from fulfilling its obligations towards Vegiffy or Customers shall be promptly reported to Vegiffy by contacting the Company by writing to Vegiffy at the designated support email address …………..',
  '',
  '15. DISCLAIMERS',
  'a. To the fullest extent permitted by law, Vegiffy and its affiliates, and their respective officers, directors, members, employees, and agents, disclaim all warranties, whether express or implied, in connection with this Form, the Platform, and the Vegiffy Services, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
  'b. Vegiffy makes no warranties or representations regarding the accuracy or completeness of the content or data on the Platform, the Vegiffy Services, or any linked websites, and assumes no liability for:',
  'i. errors, mistakes, or inaccuracies of content or materials;',
  'ii. personal injury or property damage arising from the Restaurant Partner\'s access to or use of the Platform or Services;',
  'iii. unauthorised access to or use of Vegiffy\'s servers and stored personal or financial information;',
  'iv. interruption or cessation of transmission to or from the Platform or Services;',
  'v. bugs, viruses, trojan horses, or similar issues transmitted by third parties; and/or',
  'vi. errors or omissions in content or any loss or damage arising from reliance on content made available through the Platform or Services.',
  '',
  '16. LIMITATION OF LIABILITY',
  'a. For the purposes of this Clause, "Liability" includes liability arising from breach of contract, negligence, misrepresentation, tort, restitution, or any other cause of action arising out of or in connection with this Form. Vegiffy does not exclude liability that cannot be excluded by law.',
  'b. Subject thereto, Vegiffy shall not be liable for loss of profits, goodwill, business, revenue, data, contracts, anticipated savings, fraudulent Orders, or any special, indirect, or consequential losses, whether foreseeable or otherwise. Vegiffy\'s aggregate liability under this Form shall not exceed the total value of the Order giving rise to the claim.',
  '',
  '17. DISPUTE RESOLUTION',
  'a. This Agreement shall be governed by the laws of India. Courts at Hyderabad shall have exclusive jurisdiction.',
  'b. If a dispute arises regarding this Agreement, or the interpretation, breach, termination or validity of this Agreement, both Parties shall meet to attempt to resolve such disputes. If the dispute cannot be resolved within a reasonable period of time, then the Parties agree that such dispute shall be resolved by courts in Hyderabad having jurisdiction, according to Arbitration and Conciliation Act, 1996.',
  'c. If any provision of this Agreement is held to be illegal, invalid or unenforceable, in whole or in part, such provision shall be limited or eliminated to the minimum extent necessary so that the remainder of this Agreement will continue in full force and effect and be enforceable.',
  '',
  '18. FORCE MAJEURE',
  'a. Neither Party shall be liable for any failure or delay in the performance of its obligations under this Agreement (other than payment obligations) if such failure or delay arises due to events beyond its reasonable control, including but not limited to acts of God, natural disasters, floods, earthquakes, fire, epidemics or pandemics, acts of government or governmental authorities, lockdowns, curfews, internet or telecommunications failure, strikes, labour disputes, riots, civil commotion, war, terrorist acts, or any other similar event ("Force Majeure Event").',
  'b. During the continuance of a Force Majeure Event, Vegiffy shall be entitled to suspend or restrict access to the Platform without any liability. Performance of the affected obligations shall be suspended for the duration of the Force Majeure Event, and neither Party shall have any claim for damages arising therefrom.',
  '',
  '19. MISCELLANEOUS',
  'a. Waiver: Failure to enforce any right shall not constitute a waiver of such right.',
  'b. Severability: Invalidity of any provision shall not affect the remaining provisions.',
  'c. No Third-Party Rights: No third party shall have rights under this Agreement.',
  'd. No Assignment: The Restaurant Partner shall not assign or transfer its rights or obligations under this Agreement.',
  'e. Independent Contractors: The Parties are independent contractors and no agency, employment, partnership, or joint venture is created.',
  'f. Change of Control: The Restaurant Partner consents to the transfer of this Form and personal information in the event of a sale of Vegiffy\'s business or assets.',
  'g. Acceptance of Vegiffy Privacy Policy: By executing this Agreement, the Restaurant Partner agrees to be bound by Vegiffy\'s privacy policy and shall promptly notify Vegiffy of any suspected data breach and cooperate in mitigation.',
  '',
  '20. MODIFICATION',
  'a. Vegiffy may modify these Terms from time to time, and such modifications shall be effective immediately upon being reflected on the Platform and Website. The Restaurant Partner agrees to be bound by such modifications and acknowledges the importance of periodically reviewing the updated Terms.',
  'b. Where Vegiffy upgrades, modifies, or replaces the Services ("Service Modifications"), Vegiffy shall notify the Restaurant Partner in advance and provide an opportunity to review such changes. Continued use of the Services or any alternative services following such notification shall constitute acceptance of the Service Modifications.',
  '',
  'IN WITNESS WHEREOF',
  'IN WITNESS WHEREOF, the Parties hereto have executed this Restaurant Partner Agreement on this the …. day of …., 2025.',
  'This Agreement is executed in two (2) counterparts, each of which shall be deemed an original, and both of which together shall constitute one and the same instrument.',
  '',
  'FOR AND ON BEHALF OF Vegiffy',
  'Name:',
  'Designation:',
  'Signature:',
  'Date:',
  'Place:',
  '',
  'FOR AND ON BEHALF OF THE RESTAURANT PARTNER',
  `Restaurant Name: ${form.restaurantName || ''}`,
  'Name of Owner / Authorized Signatory:',
  'Designation:',
  'Signature:',
  'Date:',
  'Place:'
];

    let yPosition = 40;
    agreementContent.forEach(line => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      if (line.includes('AGREEMENT') || line.match(/^\d+\./)) {
        doc.setFont('helvetica', 'bold');
        doc.text(line, 20, yPosition);
        doc.setFont('helvetica', 'normal');
      } else {
        doc.text(line, 20, yPosition);
      }
      yPosition += 6;
    });

    doc.save('Vegiffy-Vendor-Agreement.pdf');
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = async (fileType, file) => {
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: `${file.name} exceeds 5MB size limit` });
      return;
    }

    // Compress if it's an image
    let processedFile = file;
    if (file.type.startsWith('image/')) {
      setMessage({ type: "info", text: "Compressing image..." });
      processedFile = await compressImage(file);
    }

    setFiles(prev => ({ ...prev, [fileType]: processedFile }));
    setTotalFileSize(calculateTotalSize({ ...files, [fileType]: processedFile }));
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews(prev => ({ ...prev, [fileType]: reader.result }));
      };
      reader.readAsDataURL(processedFile);
    } else {
      setPreviews(prev => ({ ...prev, [fileType]: 'pdf' }));
    }
    
    setMessage({ type: "success", text: `${file.name} added successfully` });
  };

  const removeFile = (fileType) => {
    setFiles(prev => ({ ...prev, [fileType]: null }));
    setPreviews(prev => ({ ...prev, [fileType]: null }));
    setTotalFileSize(calculateTotalSize({ ...files, [fileType]: null }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: "error", text: "Geolocation not supported by your browser" });
      return;
    }

    setMessage({ type: "info", text: "Getting your location..." });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({
          ...prev,
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6)
        }));
        setMessage({ type: "success", text: "Location fetched successfully" });
      },
      (error) => {
        setMessage({ type: "error", text: "Please allow location access or enter manually" });
      }
    );
  };

  const validateForm = () => {
    if (!form.restaurantName) return "Restaurant name is required";
    if (!form.locationName) return "Location name is required";
    if (!form.email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email";
    if (!form.mobile) return "Mobile number is required";
    if (!/^\d{10}$/.test(form.mobile)) return "Please enter a valid 10-digit mobile number";
    if (!form.password) return "Password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (!form.commission) return "Commission percentage is required";
    if (isNaN(form.commission) || parseFloat(form.commission) < 0 || parseFloat(form.commission) > 50) return "Commission must be between 0 and 50%";
    if (!form.discount) return "Discount percentage is required";
    if (isNaN(form.discount) || parseFloat(form.discount) < 0 || parseFloat(form.discount) > 100) return "Discount must be between 0 and 100%";
    if (!form.lat || !form.lng) return "Location coordinates are required";
    if (!files.image) return "Restaurant image is required";
    if (!files.fssaiLicense) return "FSSAI license is required";
    if (!files.panCard) return "PAN card is required";
    if (!files.aadharCardFront) return "Aadhar Card Front is required";
    
    // Check total file size
    if (totalFileSize > 15 * 1024 * 1024) {
      return "Total files size exceeds 15MB limit. Please compress your files.";
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Creating restaurant..." });

    try {
      const formData = new FormData();
      
      // Add form fields
      Object.keys(form).forEach(key => {
        if (form[key] !== "") formData.append(key, form[key]);
      });

      // Add files
      Object.keys(files).forEach(key => {
        if (files[key]) formData.append(key, files[key]);
      });

      // Configure axios for progress tracking
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000 // 5 minutes timeout
      };

      const res = await axios.post("https://api.Vegiffyy.com/api/restaurant", formData, config);
      
      if (res.data.success) {
        setMessage({ type: "success", text: "Restaurant created successfully!" });
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessage({ type: "error", text: res.data.message || "Creation failed" });
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setMessage({ type: "error", text: "Request timeout. Please check your internet connection." });
      } else if (err.response?.status === 413) {
        setMessage({ type: "error", text: "File size too large. Please compress images before uploading." });
      } else {
        setMessage({ type: "error", text: err.response?.data?.message || "Server error. Please try again." });
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const FileUpload = ({ title, fileType, required = false, accept = "image/*,.pdf", badgeText, icon: Icon }) => (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="text-green-600" />}
          <label className="block font-semibold text-gray-800">
            {title} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
        {badgeText && (
          <span className={`px-2 py-1 text-xs rounded font-medium ${
            badgeText === "Required" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
          }`}>
            {badgeText}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {previews[fileType] ? (
          <div className="relative">
            {previews[fileType] === 'pdf' ? (
              <div className="w-20 h-20 bg-red-50 rounded-lg border border-red-200 flex items-center justify-center">
                <FiFileText className="text-red-500 text-xl" />
              </div>
            ) : (
              <img 
                src={previews[fileType]} 
                alt="Preview" 
                className="w-20 h-20 rounded-lg border border-gray-300 object-cover" 
              />
            )}
            <button
              type="button"
              onClick={() => removeFile(fileType)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <FiX size={12} />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 bg-white">
            <FiUpload className="text-xl" />
          </div>
        )}
        
        <div>
          <input
            type="file"
            ref={fileRefs[fileType]}
            className="hidden"
            accept={accept}
            onChange={(e) => handleFileChange(fileType, e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileRefs[fileType].current?.click()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <FiUpload />
            Choose File
          </button>
          {files[fileType] && (
            <p className="text-sm text-gray-600 mt-1">
              {files[fileType].name} ({(files[fileType].size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-green-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Add New Restaurant</h1>
              <p className="text-green-100">Register your restaurant on Vegiffy platform</p>
            </div>
            <MdRestaurant className="text-3xl" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Restaurant Image */}
          <FileUpload 
            title="Restaurant Image" 
            fileType="image" 
            required 
            accept="image/*" 
            badgeText="Required"
            icon={FiImage}
          />

          {/* Progress Bar */}
          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-green-600 font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                Total file size: {(totalFileSize / 1024 / 1024).toFixed(2)} MB / 15 MB
              </p>
            </div>
          )}

          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdRestaurant className="inline mr-2 text-green-600" />
                Restaurant Name *
              </label>
              <input
                type="text"
                name="restaurantName"
                value={form.restaurantName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter restaurant name"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdLocationOn className="inline mr-2 text-green-600" />
                Location Name *
              </label>
              <input
                type="text"
                name="locationName"
                value={form.locationName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter location name"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdEmail className="inline mr-2 text-green-600" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdPhone className="inline mr-2 text-green-600" />
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="10-digit mobile number"
                maxLength="10"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdSecurity className="inline mr-2 text-green-600" />
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-sm text-green-600 hover:text-green-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdAttachMoney className="inline mr-2 text-green-600" />
                Commission % *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="commission"
                  value={form.commission}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0-50%"
                  min="0"
                  max="50"
                  step="0.1"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdDiscount className="inline mr-2 text-green-600" />
                Discount % *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discount"
                  value={form.discount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0-100%"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                <MdBusiness className="inline mr-2 text-green-600" />
                GST Number (Optional)
              </label>
              <input
                type="text"
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter GST number"
              />
            </div>
          </div>

          {/* Document Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              <FiFile className="inline mr-2" />
              Required Documents
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload 
                title="GST Certificate" 
                fileType="gstCertificate" 
                accept=".pdf,image/*"
                badgeText="Optional"
                icon={FiFileText}
              />
              <FileUpload 
                title="FSSAI License" 
                fileType="fssaiLicense" 
                required 
                accept=".pdf,image/*"
                badgeText="Required"
                icon={FiClipboard}
              />
              <FileUpload 
                title="PAN Card" 
                fileType="panCard" 
                required 
                accept=".pdf,image/*"
                badgeText="Required"
                icon={FiUser}
              />
            </div>
          </div>

          {/* Aadhar Card Section */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-800 text-lg mb-3">
              <FiUser className="inline mr-2" />
              Aadhar Card Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload 
                title="Aadhar Card Front" 
                fileType="aadharCardFront" 
                required 
                accept="image/*"
                badgeText="Required"
                icon={FiImage}
              />
              <FileUpload 
                title="Aadhar Card Back" 
                fileType="aadharCardBack" 
                accept="image/*"
                badgeText="Optional"
                icon={FiImage}
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
              <div>
                <h3 className="font-semibold text-green-800 text-lg mb-1">
                  <FiMapPin className="inline mr-2" />
                  Location Coordinates *
                </h3>
                <p className="text-green-700 text-sm">Get your current location automatically</p>
              </div>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <FiNavigation />
                Get Current Location
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="lat"
                  value={form.lat}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter latitude"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="lng"
                  value={form.lng}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter longitude"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              <MdDescription className="inline mr-2 text-green-600" />
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Brief description about your restaurant..."
            />
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              <FiStar className="inline mr-2 text-green-600" />
              Referral Code (Optional)
            </label>
            <input
              type="text"
              name="referralCode"
              value={form.referralCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter referral code"
            />
          </div>

          {/* Document Download Section */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-800 text-lg mb-3">
              <MdAssignment className="inline mr-2" />
              Required Forms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={generateDeclarationPDF}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FiDownload />
                Download Declaration Form
              </button>
              
              <button
                type="button"
                onClick={generateVendorAgreementPDF}
                className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FiFileText />
                Download Vendor Agreement
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2 flex-1"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Restaurant...
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  Create Restaurant
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 flex-1"
            >
              <FiX />
              Cancel
            </button>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`p-4 rounded-lg border ${
              message.type === "success" ? "bg-green-50 text-green-800 border-green-200" :
              message.type === "error" ? "bg-red-50 text-red-800 border-red-200" :
              "bg-blue-50 text-blue-800 border-blue-200"
            }`}>
              <div className="flex items-center gap-2">
                {message.type === "success" ? <FiCheckCircle /> :
                 message.type === "error" ? <FiAlertCircle /> :
                 <FiAlertCircle />}
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddVendorForm;