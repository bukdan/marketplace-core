
-- Buat trigger pada tabel profiles agar setiap user baru dapat 500 kredit otomatis
CREATE OR REPLACE TRIGGER on_profile_created_give_credits
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_credits();

-- Buat trigger wallet jika belum ada
CREATE OR REPLACE TRIGGER on_profile_created_create_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_wallet();
