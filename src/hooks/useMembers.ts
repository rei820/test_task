import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Member } from '../types/task';

const MEMBER_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
];

function toMember(row: { id: string; name: string; color: string; is_admin: boolean; pin: string | null }): Member {
  return { id: row.id, name: row.name, color: row.color, isAdmin: row.is_admin, pin: row.pin ?? undefined };
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初回フェッチ
    supabase.from('members').select('*').order('created_at').then(({ data }) => {
      if (data) setMembers(data.map(toMember));
      setLoading(false);
    });

    // リアルタイム購読
    const channel = supabase
      .channel('members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        supabase.from('members').select('*').order('created_at').then(({ data }) => {
          if (data) setMembers(data.map(toMember));
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addMember = async (name: string, isAdmin = false, pin?: string): Promise<Member> => {
    const color = MEMBER_COLORS[members.length % MEMBER_COLORS.length];
    const { data, error } = await supabase
      .from('members')
      .insert({ name: name.trim(), color, is_admin: isAdmin, pin: pin ?? null })
      .select()
      .single();
    if (error || !data) throw error;
    return toMember(data);
  };

  const deleteMember = async (id: string) => {
    await supabase.from('members').delete().eq('id', id);
  };

  const updateMember = async (id: string, data: Partial<Pick<Member, 'isAdmin' | 'pin' | 'name'>>) => {
    await supabase.from('members').update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.isAdmin !== undefined && { is_admin: data.isAdmin }),
      ...(data.pin !== undefined && { pin: data.pin ?? null }),
    }).eq('id', id);
  };

  const getMember = (id: string) => members.find((m) => m.id === id);

  return { members, loading, addMember, deleteMember, updateMember, getMember };
}
