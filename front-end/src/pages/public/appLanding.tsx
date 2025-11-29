import { Container, Title, Text, Button, Group, Stack, Card, Grid, Box, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { useState, useEffect } from 'react';
import classes from './appLanding.module.css';
import iconLightWithText from '../../assets/icon_light_with_text.png';
import iconDarkWithText from '../../assets/icon_light_with_text.png';
import appImage1 from '../../assets/app/app01.png';
import appImage2 from '../../assets/app/app02.png';
import appImage3 from '../../assets/app/app03.png';

interface FeatureCardProps {
  icon: IconName;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Card shadow="md" radius="lg" p="xl" className={classes.featureCard}>
    <Stack gap="md" align="center">
      <Box className={classes.iconWrapper}>
        <FontAwesomeIcon icon={icon} size="3x" />
      </Box>
      <Title order={3} ta="center">{title}</Title>
      <Text size="sm" c="dimmed" ta="center">
        {description}
      </Text>
    </Stack>
  </Card>
);

export const AppLandingPage = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [appVersion, setAppVersion] = useState<string>('');
  
  const appImages = [appImage1, appImage2, appImage3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % appImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [appImages.length]);

  useEffect(() => {
    // Fetch download URL from Firestore
    const fetchDownloadUrl = async () => {
      try {
        const response = await fetch(
          'https://firestore.googleapis.com/v1/projects/svitlo-power/databases/(default)/documents/sites/app'
        );
        const data = await response.json();
        
        if (data.fields?.updateUrl?.stringValue) {
          setDownloadUrl(data.fields.updateUrl.stringValue);
        }
        if (data.fields?.ver?.stringValue) {
          setAppVersion(data.fields.ver.stringValue);
        }
      } catch (error) {
        console.error('Failed to fetch download URL:', error);
      }
    };

    fetchDownloadUrl();
  }, []);

  const features = [
    {
      icon: 'bolt' as IconName,
      title: 'Real-Time Monitoring',
      description: 'Track the power status of Sviltopark residential complex in real-time from anywhere'
    },
    {
      icon: 'chart-bar' as IconName,
      title: 'Power Statistics',
      description: 'Detailed statistics of power generation and energy usage analytics'
    },
    {
      icon: 'calendar-check' as IconName,
      title: 'Outage Schedule',
      description: 'Stay informed with up-to-date planned power outage schedules for your area'
    },
    {
      icon: 'mobile' as IconName,
      title: 'Modern Interface',
      description: 'Intuitive and beautiful design with dark and light themes for the best user experience'
    }
  ];

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      console.error('Download URL not available');
    }
  };

  return (
    <Box className={classes.wrapper}>
      {/* Theme Toggle */}
      <Box className={classes.themeToggle}>
        <ActionIcon
          onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
          variant="default"
          size="xl"
          aria-label="Toggle color scheme"
        >
          <FontAwesomeIcon icon={isDark ? 'sun' : 'moon'} size="lg" />
        </ActionIcon>
      </Box>

      {/* Hero Section */}
      <Box className={classes.hero}>
        <Container size="lg" py={80}>
          <Grid align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xl">
                <Group gap="md" align="center">
                  <img 
                    src={isDark ? iconDarkWithText : iconLightWithText}
                    alt="Svitlo Power Logo" 
                    className={classes.titleLogo}
                  />
                 
                </Group>
                <Text size="xl" className={classes.subtitle}>
                  Complete Power Monitoring for Sviltopark Residential Complex
                </Text>
                <Text size="md" className={classes.description}>
                  Modern mobile app for monitoring power stations and tracking power outage schedules 
                  in Sviltopark. Stay informed about power status and plan your electricity usage 
                  with real-time outage updates and schedules.
                </Text>
                <Group>
                  <Button 
                    size="xl" 
                    leftSection={<FontAwesomeIcon icon="download" />}
                    onClick={handleDownload}
                    className={classes.primaryButton}
                    disabled={!downloadUrl}
                  >
                    Download APK
                  </Button>
                </Group>
                <Group gap="md">
                  <Text size="sm" c="dimmed">
                    <FontAwesomeIcon icon="mobile" /> Android 13.0 or higher required
                  </Text>
                  {appVersion && (
                    <>
                      <Text size="sm" c="dimmed">•</Text>
                      <Text size="sm" c="dimmed">
                        Version {appVersion}
                      </Text>
                    </>
                  )}
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box className={classes.heroImageWrapper}>
                <Box className={classes.phonePreview}>
                  {appImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Svitlo Power App Screenshot ${index + 1}`}
                      className={`${classes.appScreenshot} ${
                        index === currentImageIndex ? classes.active : ''
                      }`}
                    />
                  ))}
                </Box>
                <Box className={classes.carouselDots}>
                  {appImages.map((_, index) => (
                    <button
                      key={index}
                      className={`${classes.dot} ${
                        index === currentImageIndex ? classes.activeDot : ''
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Go to screenshot ${index + 1}`}
                    />
                  ))}
                </Box>
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box className={classes.features}>
        <Container size="lg" py={80}>
          <Stack gap="xl" align="center" mb={60}>
            <Title order={2} ta="center" className={classes.sectionTitle}>
              App Features
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={600}>
              Svitlo Power provides all the essential tools for effective monitoring 
              of power status and tracking outage schedules in Sviltopark
            </Text>
          </Stack>
          
          <Grid gutter="xl">
            {features.map((feature, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
                <FeatureCard {...feature} />
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box className={classes.cta}>
        <Container size="lg" py={80}>
          <Stack gap="xl" align="center">
            <Title order={2} ta="center" className={classes.ctaTitle}>
              Ready to Get Started?
            </Title>
            <Text size="lg" ta="center" className={classes.ctaDescription} maw={600}>
              Download Svitlo Power now and stay informed about power status, 
              outage schedules, and electricity monitoring in Sviltopark residential complex
            </Text>
            <Button 
              size="xl" 
              leftSection={<FontAwesomeIcon icon="download" />}
              onClick={handleDownload}
              className={classes.primaryButton}
            >
              Download APK
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box className={classes.footer}>
        <Container size="lg" py={40}>
          <Stack gap="md" align="center">
            <Group gap="xl">
              <Text size="sm" c="dimmed">© {new Date().getFullYear()} Svitlo Power</Text>
              <Text size="sm" c="dimmed">•</Text>
              <Text size="sm" c="dimmed">Sviltopark Power Monitoring</Text>
            </Group>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

