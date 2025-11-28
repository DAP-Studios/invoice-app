import React, { useState, useEffect } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import { CompanySettings } from '../types';
import { Button } from '../components/Button';
import { saveLogo, loadLogo } from '../utils/storage';
import './Settings.css';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useInvoices();
  
  const [formData, setFormData] = useState<CompanySettings>(
    settings || {
      companyName: '',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      companyWebsite: '',
      bankName: '',
      bankAccount: '',
      bankIFSC: '',
      termsAndConditions: ['Payment due within 30 days', 'Goods once sold will not be taken back']
    }
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadedLogo = loadLogo();
    setLogoPreview(loadedLogo);
  }, []);

  const handleChange = (field: keyof CompanySettings, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        saveLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    alert('✅ Settings saved successfully!');
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <p className="page-subtitle">Configure your company and invoice details</p>

      <div className="settings-container">
        <form onSubmit={handleSubmit}>
          <div className="settings-section">
            <h3>Company Information</h3>
            
            <div className="form-group">
              <label>Company Logo</label>
              <div className="logo-upload-section">
                {logoPreview && (
                  <div className="logo-preview">
                    <img src={logoPreview} alt="Company Logo" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="file-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Company Address *</label>
              <textarea
                value={formData.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.companyPhone}
                  onChange={(e) => handleChange('companyPhone', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => handleChange('companyEmail', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="text"
                value={formData.companyWebsite}
                onChange={(e) => handleChange('companyWebsite', e.target.value)}
              />
            </div>
          </div>

          <div className="settings-section">
            <h3>Bank Details</h3>
            
            <div className="form-group">
              <label>Bank Name *</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => handleChange('bankAccount', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>IFSC Code *</label>
                <input
                  type="text"
                  value={formData.bankIFSC}
                  onChange={(e) => handleChange('bankIFSC', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Terms & Conditions</h3>
            <div className="info-box">
              <p>Default terms and conditions for your invoices.</p>
            </div>
            <div className="form-group">
              <textarea
                value={formData.termsAndConditions.join('\n')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    termsAndConditions: e.target.value.split('\n')
                  })
                }
                rows={5}
                placeholder="Enter each term on a new line"
              />
            </div>
          </div>

          <div className="form-actions">
            <Button type="submit">Save Settings</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
