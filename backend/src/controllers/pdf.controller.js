const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { pdfService } = require('../services');

const generateTherapistReport = catchAsync(async (req, res) => {
  const { therapistId } = req.params;
  
  try {
    const pdfBuffer = await pdfService.generateTherapistReport(therapistId);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=therapist_report_${therapistId}_${Date.now()}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send the PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to generate PDF report',
      error: error.message
    });
  }
});

module.exports = {
  generateTherapistReport,
};
