import React from 'react';
import Input from '../../ui/Input/Input';
import TNDistricts from '../../../utils/tnDistricts';
import styles from './ProfileForm.module.css';

const ProfileForm = ({ 
  user, 
  editForm, 
  isEditing, 
  profileCompletion, 
  onInputChange 
}) => {
  const isVolunteer = user?.role === 'volunteer';

  const isFieldMissing = (field) => {
    return profileCompletion?.missingFields?.includes(field);
  };

  const renderReadOnlyField = (value, missingText) => (
    <p className={`${styles.readOnlyField} ${!value ? styles.readOnlyFieldMissing : ''}`}>
      {value || missingText}
    </p>
  );

  return (
    <div className={styles.profileForm}>
      {/* Basic Information */}
      <Input
        label="Full Name"
        value={isEditing ? (editForm.name || '') : ''}
        onChange={isEditing ? (e) => onInputChange('name', e.target.value) : undefined}
        placeholder="Enter your full name"
        required
        isRequired
        error={isFieldMissing('name')}
        disabled={!isEditing}
      />
      {!isEditing && renderReadOnlyField(user.name, 'Required - Please add your full name')}

      <div>
        <Input
          label="Email Address"
          value={user.email}
          disabled
          helpText="Cannot be changed"
        />
      </div>

      <Input
        label="District/Area"
        type="select"
        value={isEditing ? (editForm.district || '') : ''}
        onChange={isEditing ? (e) => onInputChange('district', e.target.value) : undefined}
        required
        isRequired
        error={isFieldMissing('district')}
        disabled={!isEditing}
      >
        <option value="">Select district</option>
        {TNDistricts.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </Input>
      {!isEditing && renderReadOnlyField(user.district, 'Required - Please add your district/area')}

      <div>
        <Input
          label="Account Type"
          value=""
          disabled
        />
        <div className={`${styles.roleTag} ${isVolunteer ? styles.volunteerTag : styles.citizenTag}`}>
          {isVolunteer ? '🤝 Volunteer' : '👤 Citizen'}
        </div>
      </div>

      {/* Volunteer-specific fields */}
      {isVolunteer && (
        <>
          <hr className={styles.sectionDivider} />
          <h3 className={styles.sectionTitle}>
            Volunteer Information
          </h3>
          
          <Input
            label="Phone Number"
            type="tel"
            value={isEditing ? (editForm.phone || '') : ''}
            onChange={isEditing ? (e) => onInputChange('phone', e.target.value) : undefined}
            placeholder="Enter your phone number"
            required
            isRequired
            error={isFieldMissing('phone')}
            disabled={!isEditing}
          />
          {!isEditing && renderReadOnlyField(user.phone, 'Required - Please add your phone number')}

          <Input
            label="Transportation"
            type="select"
            value={isEditing ? (editForm.transportation || '') : ''}
            onChange={isEditing ? (e) => onInputChange('transportation', e.target.value) : undefined}
            required
            isRequired
            error={isFieldMissing('transportation')}
            disabled={!isEditing}
          >
            <option value="">Select transportation</option>
            <option value="walking">Walking</option>
            <option value="bicycle">Bicycle</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="car">Car</option>
            <option value="public_transport">Public Transport</option>
          </Input>
          {!isEditing && renderReadOnlyField(user.transportation, 'Required - Please select transportation method')}

          <Input
            label="Skills & Expertise"
            type="textarea"
            value={isEditing ? (editForm.skills || '') : ''}
            onChange={isEditing ? (e) => onInputChange('skills', e.target.value) : undefined}
            placeholder="Describe your skills and areas of expertise"
            required
            isRequired
            error={isFieldMissing('skills')}
            disabled={!isEditing}
            className={styles.fullWidth}
          />
          {!isEditing && (
            <div className={styles.fullWidth}>
              {renderReadOnlyField(user.skills, 'Required - Please describe your skills and expertise')}
            </div>
          )}

          <Input
            label="Availability"
            type="textarea"
            value={isEditing ? (editForm.availability || '') : ''}
            onChange={isEditing ? (e) => onInputChange('availability', e.target.value) : undefined}
            placeholder="When are you available to volunteer?"
            required
            isRequired
            error={isFieldMissing('availability')}
            disabled={!isEditing}
            className={styles.fullWidth}
          />
          {!isEditing && (
            <div className={styles.fullWidth}>
              {renderReadOnlyField(user.availability, 'Required - Please specify your availability')}
            </div>
          )}

          <Input
            label="Experience Description"
            type="textarea"
            value={isEditing ? (editForm.experience || '') : ''}
            onChange={isEditing ? (e) => onInputChange('experience', e.target.value) : undefined}
            placeholder="Describe your relevant experience"
            required
            isRequired
            error={isFieldMissing('experience')}
            disabled={!isEditing}
            className={styles.fullWidth}
          />
          {!isEditing && (
            <div className={styles.fullWidth}>
              {renderReadOnlyField(user.experience, 'Required - Please describe your experience')}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileForm;