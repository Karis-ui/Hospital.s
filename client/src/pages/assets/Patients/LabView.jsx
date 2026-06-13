import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Rating,
  LinearProgress,
  Tooltip,
  Zoom,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  ListItemAvatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Slider,
  Switch,
  Badge,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Science as LabIcon,
  Biotech as TestIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Description as DescriptionIcon,
  FilePresent as FileIcon,
  PictureAsPdf as PdfIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  RemoveCircle as RemoveIcon,
  AddCircle as AddIcon,
  Error as ErrorIcon,
  WarningAmber as AlertIcon,
  MedicalInformation as MedicalInfoIcon,
  Bloodtype as BloodIcon,
  WaterDrop as UrineIcon,
  BiotechSharp as MicrobeIcon,
  BloodtypeTwoTone as DNAIcon,
  RadioOutlined as XRayIcon,
  Favorite as HeartIcon,
  ScienceOutlined as FlaskIcon,
} from '@mui/icons-material';
import { format, formatDistance } from 'date-fns';
import { toast } from 'react-toastify';
import PatientService from '../../../services/users/patient';
import { labServices } from '../../../services/users/labtech';
import { formatDate, formatTime, formatCurrency } from '../../../formatters';
import { tr } from 'date-fns/locale';

const ResultCard = styled(Card)(({ theme, abnormal }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  border: `1px solid ${abnormal ? alpha(theme.palette.error.main, 0.3) : alpha(theme.palette.success.main, 0.1)}`,
  backgroundColor: abnormal ? alpha(theme.palette.error.main, 0.02) : 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[5],
  },
}));

const AbnormalBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.error.main, 0.1),
  color: theme.palette.error.main,
  borderColor: theme.palette.error.main,
  fontWeight: 600,
}));

const NormalBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.success.main, 0.1),
  color: theme.palette.success.main,
  borderColor: theme.palette.success.main,
  fontWeight: 600,
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 0),
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  minHeight: 48,
}));

const testIcons = {
  'blood': <BloodIcon />,
  'urine': <UrineIcon />,
  'microbiology': <MicrobeIcon />,
  'pathology': <DNAIcon />,
  'radiology': <XRayIcon />,
  'cardiology': <HeartIcon />,
  'default': <FlaskIcon />,
};

export const Labview = () =>{
    const {id} = useParams();
    const navigate = useNavigate();
    const [loading,setLoading] = useState(true);
    const [result,setResult] = useState(null);
    const [error,setError] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [shareDialog, setShareDialog] = useState(false);
    const [shareEmail,setShareEmail] = useState('');
    const [shareNote, setShareNote] = useState('');
    const [printMode,setPrintMode] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);
    const [showComparison,setShowComparison] = useState(false);
    const [anchor,setAnchor] = useState(null);

    useEffect(() =>{
        fetchLabResult();
    },[id]);

    const fetchLabResult = async() =>{
        try{
            setLoading(true);
            const response = await PatientService.viewLab(id);
            setResult(response.data);
            setError('');
        }catch(err){
            console.error('Failed: ',err);
            setError('Failed to fetch lab results.');
            toast.error('Failed to load lab result.');
        }finally{
            setLoading(false);
        }
    };

    const handleDownloadPdf = async() =>{
        try{
            toast.info('Preparing PDF download...');
            const response = await PatientService.downloadLabReport();
            setResult(response.data);
            await new Promise(resolve => setTimeout(resolve,1500));
            toast.success('PDF downloaded successfully.');
        }catch(err){
            toast.error('Failed to download PDF');
        }
    };

    const handlePrint =() =>{
        setPrintMode(true);
        setTimeout(() =>{
            window.print();
            setPrintMode(false);
        },100);
    };

    const handleShare = () =>{
        if(navigator.share){
            navigator.share({url: window.location.href});
        }else{
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        }
    };

    const handleShareSubmit = async()=>{
        try{
            toast.success(`Result shared with ${shareEmail}`);
            setShareDialog(false);
            setShareEmail('');
            setShareNote('');
        }catch(err){
            toast.error('Failed to share result.');
        }
    };
}