import streamlit as st
import re
import pandas as pd

st.set_page_config(page_title="Log Error Analyzer", layout="wide")

st.title("🔍 Log Error Analyzer")
st.write("Upload a log file and get **error explanations + possible root cause**.")

uploaded_file = st.file_uploader("📂 Upload log file", type=["txt", "log"])

if not uploaded_file:
    st.stop()

# -------------------------------------------------------------------
# RULE-BASED ERROR CATEGORIZATION
# -------------------------------------------------------------------

error_patterns = {
    "Bluetooth Disconnect": [
        r"hfp.*disconnect",
        r"a2dp.*disconnect",
        r"bt.*disconnected",
        r"connection lost",
        r"link loss"
    ],
    "Timeout": [
        r"timeout",
        r"timed out",
        r"no response",
        r"waiting too long"
    ],
    "Null Pointer / Object Missing": [
        r"null pointer",
        r"nullpointer",
        r"object reference not set",
        r"attributeerror"
    ],
    "I/O or Hardware Failure": [
        r"ioerror",
        r"i/o error",
        r"hardware failure",
        r"device not ready",
        r"no such device"
    ],
    "Parsing / Format Error": [
        r"parse error",
        r"format exception",
        r"invalid json",
        r"invalid input"
    ],
    "Authentication / Permission Error": [
        r"permission denied",
        r"not authorized",
        r"auth failed",
        r"authentication error"
    ],
    "Network Error": [
        r"network unreachable",
        r"connection refused",
        r"host unreachable",
        r"no internet"
    ],
    "Crash / Fatal": [
        r"fatal",
        r"crash",
        r"segmentation fault",
        r"core dumped"
    ]
}


# Human-readable explanations
error_explanations = {
    "Bluetooth Disconnect": 
        "The BT link dropped. Possible causes: weak signal, device moved out of range, stack crash, or HFP/A2DP mismatch.",
    "Timeout": 
        "Something took too long to respond. Likely cause: slow service, deadlock, poor signal, or waiting for unavailable data.",
    "Null Pointer / Object Missing": 
        "A variable was used before being set. Common root cause: race condition, missing initialization, or corrupted state.",
    "I/O or Hardware Failure": 
        "The system couldn't access a device. Possible reasons: hardware not ready, driver issue, or port failure.",
    "Parsing / Format Error": 
        "Log contains malformed data. Likely bad input format or unexpected response from subsystem.",
    "Authentication / Permission Error":
        "Operation blocked due to missing permissions or failed authentication.",
    "Network Error": 
        "Network path unavailable. Caused by connectivity loss, WIFI drop, server unreachable.",
    "Crash / Fatal": 
        "Program hit a fatal issue and crashed. Root cause depends on context: memory, illegal state, invalid access."
}

# -------------------------------------------------------------------
# PROCESS FILE
# -------------------------------------------------------------------

lines = uploaded_file.read().decode("utf-8", errors="replace").splitlines()

analysis = []

for i, line in enumerate(lines, start=1):
    lower = line.lower()
    matched_category = None

    for category, patterns in error_patterns.items():
        for p in patterns:
            if re.search(p, lower):
                matched_category = category
                break
        if matched_category:
            break

    if matched_category:
        analysis.append({
            "Line No": i,
            "Error Line": line.strip(),
            "Category": matched_category,
            "Possible Cause": error_explanations[matched_category]
        })

# -------------------------------------------------------------------
# DISPLAY RESULTS
# -------------------------------------------------------------------

st.header("🚨 Detected Errors (with explanations)")

if not analysis:
    st.success("No errors found in the log! 🎉")
else:
    df = pd.DataFrame(analysis)
    st.dataframe(df, use_container_width=True, height=500)

    st.header("📌 Root Cause Summary")
    summary = df.groupby("Category").size().reset_index(name="Count")
    st.table(summary)

    st.header("🧠 Explanation of All Error Types Found")
    for category in summary["Category"]:
        st.subheader(f"🔹 {category}")
        st.write(error_explanations[category])
