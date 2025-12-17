import { useState, useEffect } from 'react';

export const useProfileCompletion = (user) => {
  const [profileCompletion, setProfileCompletion] = useState(null);

  const getRequiredFields = (role) => {
    const baseFields = ['name', 'district'];
    
    if (role === 'volunteer') {
      return [
        ...baseFields,
        'phone',
        'skills',
        'availability',
        'experience',
        'transportation'
      ];
    }
    
    return baseFields;
  };

  const checkProfileCompletion = (userData) => {
    if (!userData) return { isComplete: false, missingFields: [], completionPercentage: 0 };
    
    const requiredFields = getRequiredFields(userData.role);
    const missingFields = [];
    let filledFields = 0;

    requiredFields.forEach(field => {
      if (!userData[field] || userData[field].trim() === '') {
        missingFields.push(field);
      } else {
        filledFields++;
      }
    });

    const completionPercentage = Math.round((filledFields / requiredFields.length) * 100);
    const isComplete = missingFields.length === 0;

    return {
      isComplete,
      missingFields,
      completionPercentage,
      totalFields: requiredFields.length,
      filledFields
    };
  };

  const getFieldDisplayName = (field) => {
    const fieldNames = {
      name: 'Full Name',
      district: 'District/Area',
      phone: 'Phone Number',
      skills: 'Skills & Expertise',
      availability: 'Availability',
      experience: 'Experience Description',
      transportation: 'Transportation Method'
    };
    return fieldNames[field] || field;
  };

  useEffect(() => {
    if (user) {
      const completion = checkProfileCompletion(user);
      setProfileCompletion(completion);
    }
  }, [user]);

  return {
    profileCompletion,
    getFieldDisplayName,
    checkProfileCompletion
  };
};

export default useProfileCompletion;