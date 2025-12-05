import * as XLSX from "xlsx";

export function exportToExcel(data: any[], filename: string, sheetName: string = "Sheet1") {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

export function exportGTMStrategyToExcel(gtmStrategy: any, icpData: any, filename: string = "gtm-strategy.xlsx") {
  try {
    const workbook = XLSX.utils.book_new();

    const summaryData = [
    { Field: "GTM Summary", Value: gtmStrategy.gtm_summary || "" },
  ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "GTM Summary");

    const channelsData = gtmStrategy.top_channels_ranked?.map((ch: any, idx: number) => ({
    Rank: idx + 1,
    Channel: ch.channel || "",
    "Why It Matters": ch.why_it_matters || "",
    "Expected Results": ch.expected_results || "",
    Difficulty: ch.difficulty || "",
    })) || [];
    const channelsSheet = XLSX.utils.json_to_sheet(channelsData);
    XLSX.utils.book_append_sheet(workbook, channelsSheet, "Top Channels");

    const planData = [
    ...(gtmStrategy["48_hour_plan"]?.day_1?.map((task: string, idx: number) => ({
      Day: "Day 1",
      Task: task || "",
      Order: idx + 1,
    })) || []),
    ...(gtmStrategy["48_hour_plan"]?.day_2?.map((task: string, idx: number) => ({
      Day: "Day 2",
      Task: task || "",
      Order: idx + 1,
    })) || []),
    ];
    const planSheet = XLSX.utils.json_to_sheet(planData);
    XLSX.utils.book_append_sheet(workbook, planSheet, "48-Hour Plan");

    const messagingData = [
      { Type: "Primary Value Prop", Content: gtmStrategy.messaging?.primary_value_prop || "" },
      { Type: "One-Line Pitch", Content: gtmStrategy.messaging?.one_line_pitch || "" },
      ...(gtmStrategy.messaging?.email_subject_lines?.map((line: string, idx: number) => ({
        Type: `Email Subject ${idx + 1}`,
        Content: line || "",
      })) || []),
      ...(gtmStrategy.messaging?.linkedin_openers?.map((line: string, idx: number) => ({
        Type: `LinkedIn Opener ${idx + 1}`,
        Content: line || "",
      })) || []),
      ...(gtmStrategy.messaging?.reddit_post_hooks?.map((line: string, idx: number) => ({
        Type: `Reddit Hook ${idx + 1}`,
        Content: line || "",
      })) || []),
      ...(gtmStrategy.messaging?.twitter_hooks?.map((line: string, idx: number) => ({
        Type: `Twitter Hook ${idx + 1}`,
        Content: line || "",
      })) || []),
    ];
    const messagingSheet = XLSX.utils.json_to_sheet(messagingData);
    XLSX.utils.book_append_sheet(workbook, messagingSheet, "Messaging Assets");

    const outreachData = [
      { Type: "Cold Email", Content: gtmStrategy.outreach_templates?.cold_email || "" },
      { Type: "LinkedIn DM", Content: gtmStrategy.outreach_templates?.linkedin_dm || "" },
      { Type: "Reddit Post", Content: gtmStrategy.outreach_templates?.reddit_post || "" },
      { Type: "Twitter Pitch", Content: gtmStrategy.outreach_templates?.twitter_pitch || "" },
    ];
    const outreachSheet = XLSX.utils.json_to_sheet(outreachData);
    XLSX.utils.book_append_sheet(workbook, outreachSheet, "Outreach Templates");

    const targetsData = [
    ...(gtmStrategy.ideal_targets?.titles?.map((title: string) => ({
      Category: "Title",
      Value: title || "",
    })) || []),
    ...(gtmStrategy.ideal_targets?.industries?.map((industry: string) => ({
      Category: "Industry",
      Value: industry || "",
    })) || []),
    ...(gtmStrategy.ideal_targets?.communities?.map((community: string) => ({
      Category: "Community",
      Value: community || "",
    })) || []),
    ...(gtmStrategy.ideal_targets?.search_queries?.map((query: string) => ({
      Category: "Search Query",
      Value: query || "",
    })) || []),
    ];
    const targetsSheet = XLSX.utils.json_to_sheet(targetsData);
    XLSX.utils.book_append_sheet(workbook, targetsSheet, "Ideal Targets");

    const launchData = [
      { Asset: "Landing Page Headline", Content: gtmStrategy.launch_assets?.landing_page_headline || "" },
      { Asset: "Landing Page Subheadline", Content: gtmStrategy.launch_assets?.landing_page_subheadline || "" },
      { Asset: "Product Hunt Tagline", Content: gtmStrategy.launch_assets?.product_hunt_tagline || "" },
      { Asset: "Twitter Bio", Content: gtmStrategy.launch_assets?.twitter_bio || "" },
    ];
    const launchSheet = XLSX.utils.json_to_sheet(launchData);
    XLSX.utils.book_append_sheet(workbook, launchSheet, "Launch Assets");

    const risksData = [
    ...(gtmStrategy.risks_and_missteps?.map((risk: string) => ({
      Type: "Risk/Misstep",
      Content: risk || "",
    })) || []),
    ...(gtmStrategy.success_metrics?.first_48_hours?.map((metric: string) => ({
      Type: "48-Hour Metric",
      Content: metric || "",
    })) || []),
    ...(gtmStrategy.success_metrics?.first_7_days?.map((metric: string) => ({
      Type: "7-Day Metric",
      Content: metric || "",
    })) || []),
    ];
    const risksSheet = XLSX.utils.json_to_sheet(risksData);
    XLSX.utils.book_append_sheet(workbook, risksSheet, "Risks & Metrics");

    if (icpData) {
    const icpSummaryData = [
      { Field: "Role", Value: icpData.primaryICP?.role || "" },
      { Field: "Company Size", Value: icpData.primaryICP?.companySize || "" },
      { Field: "Industry", Value: icpData.primaryICP?.industry || "" },
      { Field: "Geography", Value: icpData.primaryICP?.geography || "" },
      { Field: "Budget", Value: icpData.primaryICP?.budget || "" },
      ...(icpData.painPoints?.map((point: string, idx: number) => ({
        Field: `Pain Point ${idx + 1}`,
        Value: point || "",
      })) || []),
      ...(icpData.jobsToBeDone?.map((job: string, idx: number) => ({
        Field: `Job to be Done ${idx + 1}`,
        Value: job || "",
      })) || []),
      ...(icpData.whereTheyHangOut?.map((place: string, idx: number) => ({
        Field: `Where They Hang Out ${idx + 1}`,
        Value: place || "",
      })) || []),
      ];
      const icpSheet = XLSX.utils.json_to_sheet(icpSummaryData);
      XLSX.utils.book_append_sheet(workbook, icpSheet, "ICP Summary");
    }

    XLSX.writeFile(workbook, filename);
  } catch {
    throw new Error("Failed to export GTM strategy to Excel");
  }
}

export function exportICPToExcel(icpData: any, filename: string = "icp-analysis.xlsx") {
  try {
    const workbook = XLSX.utils.book_new();

    const summaryData = [
    { Field: "Role", Value: icpData.primaryICP?.role || "" },
    { Field: "Company Size", Value: icpData.primaryICP?.companySize || "" },
    { Field: "Industry", Value: icpData.primaryICP?.industry || "" },
    { Field: "Geography", Value: icpData.primaryICP?.geography || "" },
    { Field: "Budget", Value: icpData.primaryICP?.budget || "" },
    { Field: "Confidence Score", Value: icpData.confidenceScore || "" },
  ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "ICP Summary");

    const painPointsData = (icpData.painPoints || []).map((point: string, idx: number) => ({
    "#": idx + 1,
    "Pain Point": point || "",
    }));
    const painPointsSheet = XLSX.utils.json_to_sheet(painPointsData);
    XLSX.utils.book_append_sheet(workbook, painPointsSheet, "Pain Points");

    const jobsData = (icpData.jobsToBeDone || []).map((job: string, idx: number) => ({
    "#": idx + 1,
    "Job to be Done": job || "",
    }));
    const jobsSheet = XLSX.utils.json_to_sheet(jobsData);
    XLSX.utils.book_append_sheet(workbook, jobsSheet, "Jobs to be Done");

    const hangoutData = (icpData.whereTheyHangOut || []).map((place: string, idx: number) => ({
    "#": idx + 1,
    "Where They Hang Out": place || "",
    }));
    const hangoutSheet = XLSX.utils.json_to_sheet(hangoutData);
    XLSX.utils.book_append_sheet(workbook, hangoutSheet, "Where They Hang Out");

    const messagingData = (icpData.messagingFixes || []).map((fix: any, idx: number) => ({
    "#": idx + 1,
    "Current": fix.current || "",
    "Improved": fix.improved || "",
    }));
    const messagingSheet = XLSX.utils.json_to_sheet(messagingData);
    XLSX.utils.book_append_sheet(workbook, messagingSheet, "Messaging Fixes");

    XLSX.writeFile(workbook, filename);
  } catch {
    throw new Error("Failed to export ICP to Excel");
  }
}

export function exportICPHistoryToExcel(history: any[], filename: string = "icp-history.xlsx") {
  const data = history.map((item, idx) => ({
    "#": idx + 1,
    URL: item.url || "",
    "Primary ICP": item.primaryICP || "",
    "Confidence Score": item.confidenceScore || "",
    "Created At": item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
    "Updated At": item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "",
  }));
  exportToExcel(data, filename, "ICP History");
}

export function exportMessagingToExcel(messaging: any, filename: string = "messaging-variants.xlsx") {
  const data = [
    { Type: "Landing Page Headline", Content: messaging.landing_page_headline || "" },
    { Type: "Value Prop One-Liner", Content: messaging.value_prop_one_liner || "" },
    { Type: "DM Opener", Content: messaging.dm_opener || "" },
  ];
  exportToExcel(data, filename, "Messaging Variants");
}

export function exportChecklistToExcel(checklist: any, filename: string = "action-checklist.xlsx") {
  try {
    const workbook = XLSX.utils.book_new();

    const todayData = (checklist.today || []).map((task: string, idx: number) => ({
      "#": idx + 1,
      Task: task || "",
      Status: "",
      "Time Estimate": "≤30 min",
    }));
    const todaySheet = XLSX.utils.json_to_sheet(todayData);
    XLSX.utils.book_append_sheet(workbook, todaySheet, "Today");

    const tomorrowData = (checklist.tomorrow || []).map((task: string, idx: number) => ({
      "#": idx + 1,
      Task: task || "",
      Status: "",
      "Time Estimate": "≤30 min",
    }));
    const tomorrowSheet = XLSX.utils.json_to_sheet(tomorrowData);
    XLSX.utils.book_append_sheet(workbook, tomorrowSheet, "Tomorrow");

    const highImpactData = (checklist.high_impact_actions || []).map((task: string, idx: number) => ({
      "#": idx + 1,
      Task: task || "",
      Status: "",
      Priority: "High",
    }));
    const highImpactSheet = XLSX.utils.json_to_sheet(highImpactData);
    XLSX.utils.book_append_sheet(workbook, highImpactSheet, "High Impact");

    const niceToHaveData = (checklist.nice_to_have || []).map((task: string, idx: number) => ({
      "#": idx + 1,
      Task: task || "",
      Status: "",
      Priority: "Low",
    }));
    const niceToHaveSheet = XLSX.utils.json_to_sheet(niceToHaveData);
    XLSX.utils.book_append_sheet(workbook, niceToHaveSheet, "Nice to Have");

    XLSX.writeFile(workbook, filename);
  } catch {
    throw new Error("Failed to export checklist to Excel");
  }
}
