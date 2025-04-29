import { Headphones, Mail } from 'lucide-react';
import React from 'react';

// Small SVG icon for list items
const ListIcon = () => (
  <svg className="inline-block w-2 h-2 mr-2 fill-current text-black" viewBox="0 0 8 8">
    <circle cx="4" cy="4" r="3" />
  </svg>
);

// LonewolfFSD Privacy Policy Component
const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-6xl py-20 md:py-32 mx-auto p-6 bg-white text-black" style={{ fontFamily: 'Poppins' }}>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-sm">
        <strong>Last Updated: April 27, 2025</strong>
      </p>
      <p className="mb-4 text-sm">
        Welcome to LonewolfFSD ("we," "us," or "our"), a modern web platform designed to empower users to create accounts,
        manage personalized profiles, and engage with a wide range of innovative services. At LonewolfFSD, your privacy is
        our utmost priority, and we are fully committed to safeguarding your personal information with the highest
        standards of care. This Privacy Policy provides a detailed explanation of how we collect, use, store, protect, and
        process your data, as well as the rights you have regarding your personal information. By accessing or using our
        platform, you acknowledge and agree to the practices described in this policy.
      </p>
      <p className="mb-8 text-sm">
        We have crafted this policy to be transparent, comprehensive, and easy to understand, avoiding complex legal jargon
        while addressing all aspects of our data practices. If you have any questions, concerns, or need further
        clarification, please refer to the "Contact Us" section at the end of this policy for our contact details.
      </p>

      {/* Section 1: Data We Collect */}
      <h2 className="text-2xl font-semibold mb-4">1. Data We Collect</h2>
      <p className="mb-4 text-sm">
        To deliver a seamless, secure, and personalized experience, LonewolfFSD collects various types of information based
        on how you interact with our platform. This section outlines the categories of data we collect, the purposes for
        which we collect them, and the methods used to ensure responsible handling. Our data collection practices are
        designed to balance functionality with your privacy, ensuring we only collect what is necessary to provide and
        improve our services.
      </p>

      <h3 className="text-xl font-medium mb-3">1.1 Personal Information</h3>
      <p className="mb-4 text-sm">
        When you register for an account, interact with our services, or engage in specific activities such as purchasing
        premium features, we may collect personal information that identifies or could be used to identify you. This
        information is critical for account management, communication, and providing tailored services. The personal
        information we collect includes:
      </p>
      <ul className="pl-6 mb-4 text-sm">
        <li className="mb-2">
          <ListIcon />
          <strong>Contact Information</strong>: Your email address is mandatory for account creation, enabling us to send
          account-related communications, such as verification emails, password reset links, and important updates.
          Optionally, you may provide your full name or phone number to unlock enhanced features, such as two-factor
          authentication or personalized support.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Account Information</strong>: During registration, you create a unique username and a secure password,
          which is encrypted before storage. You may also choose to enhance your profile by adding optional details, such
          as a biography, display name, profile picture, or social media links, to personalize your experience and express
          your identity on the platform.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Payment Information</strong>: If you subscribe to premium features or make purchases, we collect billing
          details, such as your name and billing address, through secure third-party payment processors like Stripe or
          PayPal. LonewolfFSD does not store complete payment card details on our servers; only transaction metadata (e.g.,
          transaction ID, amount, and date) is retained for record-keeping and compliance purposes.
        </li>
      </ul>

      <h3 className="text-xl font-medium mb-3">1.2 Device and Technical Information</h3>
      <p className="mb-4 text-sm">
        To ensure our platform operates efficiently, remains secure, and provides a consistent experience across devices,
        we collect technical information about your device and network. This data helps部分: This helps us diagnose issues, optimize performance, and protect against unauthorized access. The technical information we collect includes:
      </p>
      <ul className="pl-6 mb-4 text-sm">
        <li className="mb-2">
          <ListIcon />
          <strong>IP Address</strong>: Your IP address is collected to identify your approximate geographic location for
          security monitoring, fraud prevention, and region-specific content customization. For example, we may use your IP
          to display content in your preferred language or currency.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Device Information</strong>: We gather details about your device, including the device type (e.g., mobile,
          tablet, desktop), operating system (e.g., iOS, Android, Windows), browser type and version (e.g., Chrome,
          Firefox), and screen resolution. This helps us optimize our platform’s compatibility and user interface.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Usage Logs</strong>: We maintain logs of your interactions, such as pages visited, features accessed,
          buttons clicked, and timestamps. These logs enable us to analyze usage patterns, troubleshoot technical issues,
          and enhance the platform’s functionality over time.
        </li>
      </ul>

      <h3 className="text-xl font-medium mb-3">1.3 Information from Third Parties</h3>
      <p className="mb-4 text-sm">
        LonewolfFSD offers the option to log in or register using third-party authentication services, such as Google,
        GitHub. When you use these services, we may collect certain information from them, depending on the
        permissions you grant. This may include:
      </p>
      <ul className="pl-6 mb-4 text-sm">
        <li className="mb-2">
          <ListIcon />
          <strong>Profile Data</strong>: Your name, email address, or profile picture, as provided by the third-party
          service, to prefill your LonewolfFSD account details and streamline the registration process.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Authentication Tokens</strong>: Secure tokens to verify your identity and maintain a seamless login
          experience without requiring repeated credentials.
        </li>
      </ul>
      <p className="mb-4 text-sm">
        We only collect third-party data that you explicitly authorize, and we handle it in accordance with this Privacy
        Policy and the third party’s terms.
      </p>

      {/* Section 2: Account System */}
      <h2 className="text-2xl font-semibold mb-4">2. Account System</h2>
      <p className="mb-4 text-sm">
        The LonewolfFSD account system is designed to provide secure and flexible access to our platform’s features. This
        section explains how we manage account creation, security, and deletion, ensuring you have full control over your
        account and associated data.
      </p>

      <h3 className="text-xl font-medium mb-3">2.1 Registration</h3>
      <p className="mb-4 text-sm">
        To access most of LonewolfFSD’s features, such as personalized profiles, premium services, or interactive tools, you
        must create an account. Registration requires a valid email address and a strong password. You may also choose to
        customize your profile with optional information, such as a biography, avatar, or links to external portfolios,
        which allows you to showcase your identity or professional presence on the platform. We verify your email address
        during registration to ensure account security and prevent unauthorized access.
      </p>

      <h3 className="text-xl font-medium mb-3">2.2 Password Security</h3>
      <p className="mb-4 text-sm">
        Your password is a critical component of your account’s security. We encrypt all passwords using industry-standard
        hashing algorithms, such as bcrypt, to protect them from unauthorized access. To maintain security:
      </p>
      <ul className="pl-6 mb-4 text-sm">
        <li className="mb-2">
          <ListIcon />
          You are responsible for choosing a strong password and keeping it confidential.
        </li>
        <li className="mb-2">
          <ListIcon />
          LonewolfFSD will never request your password via email, phone, or other unsolicited methods.
        </li>
        <li className="mb-2">
          <ListIcon />
          We recommend enabling two-factor authentication (2FA), where available, for an additional layer of protection.
        </li>
      </ul>
      <p className="mb-4 text-sm">
        If you suspect your account has been compromised, please contact us immediately to secure your account.
      </p>

      <h3 className="text-xl font-medium mb-3">2.3 Account Deletion</h3>
      <p className="mb-4 text-sm">
        We respect your right to control your data. You can delete your LonewolfFSD account at any time through the account
        settings dashboard or by submitting a request to our support team. Upon deletion:
      </p>
      <ul className="pl-6 mb-4 text-sm">
        <li className="mb-2">
          <ListIcon />
          We will remove all personal information associated with your account, including your email, username, and profile
          details, from our active databases.
        </li>
        <li className="mb-2">
          <ListIcon />
          Certain data, such as transaction records or logs required for legal or auditing purposes, may be retained in
          anonymized form or as mandated by law.
        </li>
        <li className="mb-2">
          <ListIcon />
          The deletion process may take up to 30 days to complete, and residual data (e.g., cached backups) may be removed
          within 90 days.
        </li>
      </ul>
      <p className="mb-4 text-sm">
        To initiate deletion, follow the instructions in your account settings or contact us directly.
      </p>

      {/* Section 3: Third-Party Services */}
      <h2 className="text-2xl font-semibold mb-4">3. Third-Party Services</h2>
      <p className="mb-4 text-sm">
        To deliver a robust and scalable platform, LonewolfFSD partners with trusted third-party services for analytics,
        hosting, payment processing, and other functionalities. These providers may collect or process data on our behalf,
        and their practices are governed by their own privacy policies. Below, we outline the types of third-party services
        we use and how they handle your data.
      </p>
      <ul className="pl-6 mb-4 text-sm">
        <li className="mb-2">
          <ListIcon />
          <strong>Analytics Tools</strong>: We use services like Google Analytics and Mixpanel to understand how users
          interact with our platform. These tools collect anonymized data, such as page views, session duration, and click
          patterns, to help us identify trends and improve user experience. You can opt out of non-essential analytics
          tracking via our cookie settings.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Cloud Hosting</strong>: Our platform is hosted on secure cloud infrastructure, such as Amazon Web Services
          (AWS) or Microsoft Azure. These providers store our databases and application data but do not access your personal
          information except as necessary to provide hosting services.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Payment Processors</strong>: For premium subscriptions or in-platform purchases, we rely on processors
          like PayPal, or RazorPay. These services collect and process payment details securely, sharing only minimal
          transaction data (e.g., confirmation of payment) with us.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Authentication Services</strong>: If you log in via Google, GitGub, or similar services, they provide us
          with limited profile data (e.g., email or name) to facilitate account creation and login.
        </li>
      </ul>
      <p className="mb-4 text-sm">
        We carefully vet all third-party providers to ensure they adhere to stringent privacy and security standards,
        including compliance with regulations like GDPR and CCPA. We do not share your data with third parties for purposes
        beyond those described in this policy.
      </p>

      {/* Section 4: Cookies and Tracking Technologies */}
      <h2 className="text-2xl font-semibold mb-4">4. Cookies and Tracking Technologies</h2>
      <p className="mb-4 text-sm">
        LonewolfFSD uses cookies and similar tracking technologies, such as web beacons and local storage, to enhance your
        experience, maintain functionality, and gather insights for platform improvement. This section explains the types of
        cookies we use, their purposes, and how you can manage them.
      </p>
      <ul className="pl-6 mb-4 text-sm">
        <li className="mb-2">
          <ListIcon />
          <strong>Essential Cookies</strong>: These cookies are necessary for core platform functionality, such as
          maintaining your login session, securing your account, and enabling navigation. They cannot be disabled without
          impacting your ability to use the platform.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Analytics Cookies</strong>: These cookies collect anonymized data about how you use our platform, such as
          which pages you visit or how long you spend on certain features. This helps us optimize performance and design.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Preference Cookies</strong>: These store your settings, such as language preferences, theme choices (e.g.,
          light or dark mode), or notification settings, to provide a personalized experience.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Marketing Cookies</strong>: If you opt in, we may use cookies to deliver personalized ads or promotional
          content based on your interests. These are optional and can be disabled.
        </li>
      </ul>
      <p className="mb-4 text-sm">
        Upon your first visit, our cookie consent tool allows you to accept or decline non-essential cookies. You can
        revisit these settings at any time in your account dashboard. Additionally, most browsers allow you to block or
        delete cookies, but disabling essential cookies may limit platform functionality. For more details, visit our Cookie
        Policy page.
      </p>

      {/* Section 5: Data Storage and Security */}
      <h2 className="text-2xl font-semibold mb-4">5. Data Storage and Security</h2>
      <p className="mb-4 text-sm">
        Protecting your data is a cornerstone of LonewolfFSD’s operations. We employ robust security measures and
        industry-standard practices to safeguard your information from unauthorized access, disclosure, or loss. This
        section details how we store and secure your data.
      </p>
      <ul className="pl-6 mb-4 text-sm">
        <li className="mb-2">
          <ListIcon />
          <strong>Encryption</strong>: Data transmitted between your device and our servers is protected using Transport
          Layer Security (TLS) or Secure Sockets Layer (SSL) protocols. Sensitive data, such as passwords and payment
          metadata, is encrypted at rest using AES-256 or similar standards.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Access Controls</strong>: Access to your personal information is restricted to authorized personnel who
          require it to perform their duties. We enforce strict access controls, including role-based permissions and
          multi-factor authentication for our staff.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Security Audits</strong>: We conduct regular security audits, penetration testing, and vulnerability
          assessments to identify and address potential risks. Our systems are monitored 24/7 for suspicious activity.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Incident Response</strong>: In the unlikely event of a data breach, we have a comprehensive incident
          response plan to investigate, mitigate, and notify affected users promptly, in accordance with legal requirements.
        </li>
      </ul>
      <p className="mb-4 text-sm">
        Your data is primarily stored in secure data centers located in the United States, but it may be transferred to
        other regions if you access our services from outside the U.S. We ensure that international data transfers comply
        with applicable laws, such as GDPR’s Standard Contractual Clauses. While we take every precaution to protect your
        data, no system is entirely immune to risks, and we cannot guarantee absolute security.
      </p>

      {/* Section 6: User Rights */}
      <h2 className="text-2xl font-semibold mb-4">6. User Rights</h2>
      <p className="mb-4 text-sm">
        At LonewolfFSD, we believe you should have full control over your personal data. This section outlines your rights
        under applicable privacy laws and how you can exercise them. We are committed to transparency and compliance with
        regulations like the General Data Protection Regulation (GDPR) for EU residents and the California Consumer Privacy
        Act (CCPA) for California residents.
      </p>
      <ul className="pl-6 mb-4 text-sm">
        <li className="mb-2">
          <ListIcon />
          <strong>Right to Access</strong>: You can request a copy of all personal data we hold about you, including account
          details, usage logs, and profile information.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Right to Correction</strong>: If your data is inaccurate or incomplete, you can update it directly in your
          account settings or request assistance from our support team.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Right to Deletion</strong>: You can request the deletion of your personal data, subject to legal retention
          obligations (e.g., financial records). Deletion requests can be submitted via your account or by contacting us.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Right to Data Portability</strong>: You can request your data in a structured, machine-readable format
          (e.g., CSV or JSON) for transfer to another service.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Right to Opt-Out</strong>: You can opt out of non-essential data processing, such as marketing emails,
          analytics tracking, or personalized ads, through your account settings or cookie preferences.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Right to Non-Discrimination</strong>: Under CCPA, we will not discriminate against you (e.g., by denying
          services or charging different prices) for exercising your privacy rights.
        </li>
      </ul>
      <p className="mb-4 text-sm">
        To exercise these rights, visit the privacy tools in your account dashboard or contact us using the details below.
        We process requests within 30 days (or as required by law) and may require identity verification to protect your
        account. If you are an EU or California resident, additional rights may apply, and we will handle your request in
        accordance with GDPR or CCPA requirements.
      </p>

      {/* Section 7: Children's Privacy */}
      <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
      <p className="mb-4 text-sm">
        LonewolfFSD is designed for users aged 13 and older and is not intended for children under 13. We do not knowingly
        collect, store, or process personal information from anyone under 13 years of age. Our platform includes safeguards
        to prevent underage users from registering, such as age verification prompts during account creation.
      </p>
      <ul className="pl-6 mb-4 text-sm">
        <li className="mb-2">
          <ListIcon />
          If we discover that a child under 13 has provided personal information, we will promptly delete it from our
          systems, including any associated account data.
        </li>
        <li className="mb-2">
          <ListIcon />
          Parents or legal guardians who believe their child has submitted personal information can contact us to request
          its removal and investigate the issue.
        </li>
      </ul>
      <p className="mb-4 text-sm">
        We comply with the Children’s Online Privacy Protection Act (COPPA) and other applicable laws to protect young
        users. For more information, please contact our privacy team.
      </p>

      {/* Section 8: Changes to the Policy */}
      <h2 className="text-2xl font-semibold mb-4">8. Changes to the Policy</h2>
      <p className="mb-4 text-sm">
        LonewolfFSD may update this Privacy Policy from time to time to reflect changes in our data practices, platform
        features, or legal and regulatory requirements. We are committed to keeping you informed of any significant changes
        in a transparent and timely manner.
      </p>
      <ul className="pl-6 mb-4 text-sm">
        <li className="mb-2">
          <ListIcon />
          <strong>Notification</strong>: For material changes (e.g., new data collection practices or expanded third-party
          sharing), we will notify registered users via email and post a prominent notice on our platform at least 7 days
          before the changes take effect.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Effective Date</strong>: The updated policy will take effect upon posting, with the "Last Updated" date
          revised to reflect the change.
        </li>
        <li className="mb-2">
          <ListIcon />
          <strong>Review Recommendation</strong>: We encourage you to periodically review this policy to stay informed about
          how we protect your data. A link to the latest version is always available in the platform’s footer.
        </li>
      </ul>
      <p className="mb-4 text-sm">
        If you disagree with any changes, you may delete your account or contact us to discuss your concerns. Continued use
        of the platform after changes take effect constitutes acceptance of the updated policy.
      </p>

      {/* Section 9: Contact Us */}
      <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
      <p className="mb-4 text-sm">
        We value your feedback and are here to address any questions, concerns, or requests related to this Privacy Policy
        or your personal data. Our privacy team is dedicated to providing prompt and helpful responses.
      </p>
      <ul className="pl-6 mb-4 text-sm">
        <li className="mb-2 flex">
          <Mail className='w-4 h-4 mr-1.5 mt-0.5'/>
          <strong>Email</strong>: <a href="mailto:support@lonewolffsd.com" className="underline text-black font-semibold">
            support@lonewolffsd.com
          </a>
        </li>
        <li className="mb-2 flex items-start gap-2">
          <Headphones className="md:w-4 md:h-4 md:mt-1 w-10 h-10 -mt-3" />
          <div>
            <strong>Support Portal</strong>: Visit our 
            <a href="/support" className="underline text-black font-semibold mr-1">LonewolfFSD Support</a>
            to submit a privacy-related ticket or access self-service tools.
          </div>
        </li>

      </ul>
      <p className="mb-4 text-sm">
        We aim to respond to all inquiries within 5 business days. For urgent matters, please indicate the nature of your
        request in the subject line. If you are exercising your privacy rights (e.g., data access or deletion), we may
        require identity verification to protect your account.
      </p>
    </div>
  );
};

export default PrivacyPolicy;