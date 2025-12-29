"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Autocomplete,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import AppTheme from "@/components/theme/AppTheme";
import ColorModeIconDropdown from "@/components/theme/ColorModeIconDropdown";
import { useApi } from "@/lib/api/useApi";
import Script from "next/script";
import PaystackPop from '@paystack/inline-js'

const AGE_GROUPS = ["11-20", "21-30", "31-40", "41-50", "above 50"];
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  age_group: string;
  gender: string;
  district_id: string;
  type: "regular" | "premium";
  amount: number;
}

export default function CampiteRegistration() {
  const [mounted, setMounted] = React.useState(false);
  const params = useParams();
  const router = useRouter();
  const { $api } = useApi();
  const campId = params?.camp as string;

  // Prevent hydration mismatch by only rendering on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const campResult = $api.useQuery("get", "/api/v1/camps/{id}", {
    params: { path: { id: campId } },
  });

  const [districtSearch, setDistrictSearch] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [paystackReady, setPaystackReady] = React.useState(false);

  const camp = campResult?.data?.data;
  const isFreeRegistration = camp?.fee === 0;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      age_group: "",
      gender: "",
      district_id: "",
      type: "regular",
      amount: camp?.fee ?? 0,
    },
  });
  const campiteType = watch("type");
  const currentAmount = watch("amount");
  // Fetch all districts once and filter client-side
  const districtsResult = $api.useQuery("get", "/api/v1/districts/list", {
    params: {
      query: {
        page: 0,
      },
    },
  });

  const allDistricts = districtsResult.data?.success
    ? districtsResult.data.data
    : [];

  const filteredDistricts = React.useMemo(() => {
    if (!districtSearch) return allDistricts;
    const term = districtSearch.toLowerCase();
    return allDistricts.filter((d) => d.name.toLowerCase().includes(term));
  }, [allDistricts, districtSearch]);

  // Set amount based on campite type and camp fee
  React.useEffect(() => {
    if (campiteType === "regular" && camp?.fee !== undefined) {
      setValue("amount", camp.fee);
    }
  }, [campiteType, camp?.fee, setValue]);

  // Initialize mutations at component level
  const userMutation = $api.useMutation("post", "/api/v1/users");
  const campiteMutation = $api.useMutation("post", "/api/v1/campites");

  const createRegistration = async (data: FormData, paymentRef?: string) => {
    // Create user first
    const userResult = await userMutation.mutateAsync({
      body: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
      },
    });

    if (!userResult) {
      throw new Error("Failed to create user");
    }

    // Create campite
    await campiteMutation.mutateAsync({
      body: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
        age_group: data.age_group,
        gender: data.gender,
        camp_id: campId,
        user_id: userResult.data.id,
        district_id: data.district_id,
        type: data.type,
        amount: data.amount,
        payment_ref: paymentRef || null,
      },
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      setError(null);

      // If amount is 0 or free registration, skip payment
      if (data.amount === 0 || (isFreeRegistration && data.amount === 0)) {
        await createRegistration(data);
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
        return;
      }

      const popup = new PaystackPop()
      popup.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: data.email,
        amount: data.amount * 100, // Convert to kobo
        onSuccess: async (transaction) => {
          try {
            // Payment successful, create registration
            await createRegistration(data, transaction.reference);
            setSuccess(true);
            reset();
            setTimeout(() => router.push("/"), 2000);
          } catch (err: any) {
            setError(err.message || "Registration failed after payment");
          } finally {
            setSubmitting(false);
          }
        },
        onCancel: () => {
          setSubmitting(false);
          setError("Payment was cancelled");
        },
        onError: (error) => {
          setSubmitting(false);
          setError(error.message || "Payment failed");
        },
      });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (campResult.isLoading) {
    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </AppTheme>
    );
  }

  if (!camp) {
    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Typography>Camp not found</Typography>
        </Box>
      </AppTheme>
    );
  }

  return (
    <>
      <Script
        src="https://js.paystack.co/v1/inline.js"
        onLoad={() => setPaystackReady(true)}
        onError={() => setError("Failed to load payment service")}
      />
      <AppTheme>
        <CssBaseline enableColorScheme />
        <Box sx={{ position: "fixed", top: "1rem", right: "1rem" }}>
          <ColorModeIconDropdown />
        </Box>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          px: 2,
        }}
      >
        <Card sx={{ maxWidth: 800, width: "100%" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 700, mb: 1 }}
            >
              Register for {camp.title} ({camp.theme})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              {camp.theme && `Theme: ${camp.theme}`}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Registration successful! Redirecting...
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="firstname"
                    control={control}
                    rules={{ required: "First name is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="First Name"
                        fullWidth
                        error={!!errors.firstname}
                        helperText={errors.firstname?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="lastname"
                    control={control}
                    rules={{ required: "Last name is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Last Name"
                        fullWidth
                        error={!!errors.lastname}
                        helperText={errors.lastname?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email"
                        type="email"
                        fullWidth
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ required: "Phone number is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Phone Number"
                        fullWidth
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="age_group"
                    control={control}
                    rules={{ required: "Age group is required" }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.age_group}>
                        <InputLabel>Age Group</InputLabel>
                        <Select {...field} label="Age Group">
                          {AGE_GROUPS.map((group) => (
                            <MenuItem key={group} value={group}>
                              {group}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.age_group && (
                          <FormHelperText>
                            {errors.age_group.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: "Gender is required" }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.gender}>
                        <InputLabel>Gender</InputLabel>
                        <Select {...field} label="Gender">
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                        </Select>
                        {errors.gender && (
                          <FormHelperText>
                            {errors.gender.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="district_id"
                    control={control}
                    rules={{ required: "District is required" }}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        options={filteredDistricts}
                        getOptionLabel={(option) => option.name}
                        loading={districtsResult.isLoading}
                        value={filteredDistricts.find((d) => d.id === value) || null}
                        onChange={(_, data) => onChange(data?.id || "")}
                        onInputChange={(_, newValue) =>
                          setDistrictSearch(newValue)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="District"
                            error={!!errors.district_id}
                            helperText={
                              errors.district_id?.message ||
                              "Search by district name"
                            }
                            slotProps={{
                              input: {
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {districtsResult.isLoading && (
                                      <CircularProgress size={20}  />
                                    )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              },
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Campite Type</InputLabel>
                        <Select {...field} label="Campite Type">
                          <MenuItem value="regular">Regular</MenuItem>
                          <MenuItem value="premium">Premium</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  {isFreeRegistration && campiteType === "regular" ? (
                    <Controller
                      name="amount"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Donation Amount (Optional)"
                          type="number"
                          fullWidth
                          helperText={`Are you willing to support ${camp.title} financially (Any amount is appreciated).`}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      )}
                    />
                  ) : campiteType === "regular" ? (
                    <TextField
                      label="Amount"
                      value={`₦${camp.fee?.toLocaleString() || "0"}`}
                      fullWidth
                      disabled
                    />
                  ) : (
                    <Controller
                      name="amount"
                      control={control}
                      rules={{ required: "Amount is required for premium" }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.amount}>
                          <InputLabel>Premium Amount</InputLabel>
                          <Select {...field} label="Premium Amount">
                            {camp.premium_fees?.map((fee) => (
                              <MenuItem key={fee} value={fee}>
                                ₦{fee.toLocaleString()}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.amount && (
                            <FormHelperText>
                              {errors.amount.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  )}
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={submitting || success}
                  >
                    {submitting ? (
                      <CircularProgress size={24} />
                    ) : currentAmount > 0 ? (
                      `Pay ₦${currentAmount.toLocaleString()} & Register`
                    ) : (
                      "Register"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
      </AppTheme>
    </>
  );
}
