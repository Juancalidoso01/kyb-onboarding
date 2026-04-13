import { KybChrome } from "@/components/kyb-chrome";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { KybPersonalizationProvider } from "@/context/kyb-personalization";

export default function Home() {
  return (
    <KybPersonalizationProvider>
      <KybChrome>
        <OnboardingWizard />
      </KybChrome>
    </KybPersonalizationProvider>
  );
}
