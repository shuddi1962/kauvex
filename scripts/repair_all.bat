@echo off
echo Repairing all migration versions...
npx supabase migration repair --status applied 00002 --linked
npx supabase migration repair --status applied 00003 --linked
npx supabase migration repair --status applied 00004 --linked
npx supabase migration repair --status applied 00005 --linked
npx supabase migration repair --status applied 00006 --linked
npx supabase migration repair --status applied 00007 --linked
npx supabase migration repair --status applied 00008 --linked
npx supabase migration repair --status applied 00009 --linked
npx supabase migration repair --status applied 00010 --linked
npx supabase migration repair --status applied 00011 --linked
echo All repairs done!
