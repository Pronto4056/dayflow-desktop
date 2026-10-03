// This function is prepended to the recovered renderer without changing its data key.
function dayflowValidateSavedData(data) {
  const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
  if (!object(data)) throw new Error('Saved workspace must be an object');
  for (const key of ['tasks', 'cards', 'budgets', 'transactions', 'routines', 'routineOccurrences', 'events']) {
    if (data[key] !== undefined && (!Array.isArray(data[key]) || data[key].some(item => !object(item)))) {
      throw new Error('Invalid saved collection: ' + key);
    }
  }
  if (data.profile !== undefined && (!object(data.profile) || typeof data.profile.name !== 'string')) throw new Error('Invalid profile');
  if (data.theme !== undefined && !['light', 'dark'].includes(data.theme)) throw new Error('Invalid theme');
  for (const routine of data.routines || []) {
    if (!Array.isArray(routine.days) || typeof routine.name !== 'string') throw new Error('Invalid routine');
  }
  for (const card of data.cards || []) {
    if (typeof card.name !== 'string' || !Number.isFinite(card.balance) || (card.openingBalance !== undefined && !Number.isFinite(card.openingBalance))) throw new Error('Invalid card');
  }
}
