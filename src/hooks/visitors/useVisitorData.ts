import { useState, useEffect } from 'react';
import { fetchUserDepartmentName, fetchSelectableDepartments } from '@/src/services/departmentService';
import { fetchProfilesByDepartment } from '@/src/services/profileService';
import { useAuth } from '@/src/providers/AuthProvider';
import { UseFormSetValue } from 'react-hook-form';
import { VisitorFormValues } from '@/src/schemas/visitorSchema';

function useActiveUserDepartment(profile: any) {
  const [userDepartmentName, setUserDepartmentName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserDepartment() {
      if (profile?.department_id) {
        const name = await fetchUserDepartmentName(profile.department_id);
        if (name) {
          setUserDepartmentName(name);
        }
      }
    }
    fetchUserDepartment();
  }, [profile?.department_id]);

  return userDepartmentName;
}

function useDepartmentList(
  userDepartmentName: string | null,
  isSecretary: boolean,
  isRestrictedSelf: boolean,
  profile: any,
  setValue: UseFormSetValue<VisitorFormValues>
) {
  const [departments, setDepartments] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    async function fetchDepartments() {
      const data = await fetchSelectableDepartments();
        
      if (data && data.length > 0) {
        let formatted = data.map(dep => ({ label: dep.name, value: dep.id }));

        if (isSecretary) {
          formatted = formatted.filter(dep => dep.label === 'Başhekimlik');
          if (formatted.length > 0) {
            setValue('unitId', formatted[0].value, { shouldValidate: true });
          }
        } 
        else if (isRestrictedSelf && profile?.department_id) {
          setValue('unitId', profile.department_id, { shouldValidate: true });
        }

        setDepartments(formatted);
      }
    }
    
    if (userDepartmentName !== null) {
      fetchDepartments();
    }
  }, [isRestrictedSelf, isSecretary, profile?.department_id, setValue, userDepartmentName]);

  return departments;
}

function useTargetUsersList(
  selectedUnitId: string,
  isRestrictedSelf: boolean,
  user: any,
  setValue: UseFormSetValue<VisitorFormValues>
) {
  const [targetUsers, setTargetUsers] = useState<Array<{ label: string; value: string }>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      if (!selectedUnitId) {
        setTargetUsers([]);
        return;
      }
      
      setIsLoadingUsers(true);
      try {
        const data = await fetchProfilesByDepartment(selectedUnitId);

        if (data && data.length > 0) {
          let formattedUsers = data.map(u => ({
            label: `${u.first_name} ${u.last_name}`,
            value: u.id
          }));

          if (isRestrictedSelf && user) {
            formattedUsers = formattedUsers.filter(u => u.value === user.id);
            if (formattedUsers.length > 0) {
              setValue('targetUserId', user.id, { shouldValidate: true });
            }
          }
          
          setTargetUsers(formattedUsers);
        }
      } finally {
        setIsLoadingUsers(false);
      }
    }
    
    if (!isRestrictedSelf) {
      setValue('targetUserId', '');
    }
    
    fetchUsers();
  }, [selectedUnitId, setValue, isRestrictedSelf, user]);

  return { targetUsers, isLoadingUsers };
}

export function useVisitorData(
  selectedUnitId: string,
  setValue: UseFormSetValue<VisitorFormValues>
) {
  const { user, profile } = useAuth();
  
  const userDepartmentName = useActiveUserDepartment(profile);

  const isSecurity = userDepartmentName === 'Güvenlik';
  const isAdminOrSecurity = userDepartmentName === 'Admin' || userDepartmentName === 'Güvenlik';
  const isSecretary = userDepartmentName === 'Sekreter';
  const isRestrictedSelf = userDepartmentName !== null && !isAdminOrSecurity && !isSecretary;

  const departments = useDepartmentList(userDepartmentName, isSecretary, isRestrictedSelf, profile, setValue);
  const { targetUsers, isLoadingUsers } = useTargetUsersList(selectedUnitId, isRestrictedSelf, user, setValue);

  return {
    userDepartmentName,
    departments,
    targetUsers,
    isLoadingUsers,
    isSecurity,
    isSecretary,
    isRestrictedSelf
  };
}
