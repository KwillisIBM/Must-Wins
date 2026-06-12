import { supabase } from '../lib/supabaseClient';

export async function fetchUseCases() {
  const { data } = await supabase
    .from('use_cases')
    .select('*')
    .order('created_at', { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    company: row.company,
    date: row.date,
    mustWinName: row.must_win_name,
    mustWinDetails: '',
    narrative: row.narrative,
    cardHeader: row.card_header ?? null,
    goldenPathSummary: row.golden_path_summary,
    goldenPathSteps: row.golden_path_steps ?? [],
    pitch: row.pitch,
    products: row.products ?? [],
    links: row.links ?? [],
  }));
}

export async function fetchLikes(useCaseId) {
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('use_case_id', useCaseId);
  return count ?? 0;
}

export async function incrementLike(useCaseId) {
  await supabase.from('likes').insert({ use_case_id: useCaseId });
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('use_case_id', useCaseId);
  return count ?? 0;
}

export async function fetchComments(useCaseId) {
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('use_case_id', useCaseId)
    .order('created_at', { ascending: true });
  return (data ?? []).map((c) => ({
    id: c.id,
    text: c.text,
    author: c.author ?? 'Anonymous',
    timestamp: c.created_at,
  }));
}

export async function addComment(useCaseId, text) {
  const { data } = await supabase
    .from('comments')
    .insert({ use_case_id: useCaseId, text, author: 'Anonymous' })
    .select()
    .single();
  return {
    id: data.id,
    text: data.text,
    author: data.author ?? 'Anonymous',
    timestamp: data.created_at,
  };
}

export async function submitUseCase(entry) {
  const { data, error } = await supabase
    .from('use_cases')
    .insert({
      name: entry.name,
      company: entry.company,
      date: entry.date,
      must_win_name: entry.mustWinName,
      narrative: entry.narrative,
      golden_path_summary: entry.goldenPathSummary,
      golden_path_steps: entry.goldenPathSteps,
      pitch: entry.pitch,
      products: entry.products,
      links: entry.links ?? [],
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    ...entry,
    id: data.id,
  };
}
