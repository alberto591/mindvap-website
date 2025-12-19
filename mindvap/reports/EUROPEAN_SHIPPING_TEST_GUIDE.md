# European Shipping Functionality Test Guide

## Overview
This guide will help you test the newly implemented European shipping functionality in your MindVap e-commerce checkout system.

## Prerequisites
- Development server running at http://localhost:5173
- Access to the checkout flow
- Test data for European addresses

## Test Scenarios

### 1. European Country Selection Test
**Objective**: Verify that European countries are properly displayed and selectable

**Steps**:
1. Navigate to http://localhost:5173/cart
2. Add a product to cart (if not already there)
3. Click "Proceed to Checkout"
4. In the checkout form, scroll to the "Shipping Address" section
5. Locate the "Country" dropdown field
6. Click the dropdown and verify you see:
   - **Europe** group with countries like:
     - Germany (DE)
     - France (FR) 
     - Spain (ES)
     - Italy (IT)
     - Netherlands (NL)
     - Belgium (BE)
     - Austria (AT)
     - Switzerland (CH)
     - United Kingdom (GB)
     - And 20+ more European countries
   - **United States** group with:
     - United States (US)

**Expected Result**: ✅ Country dropdown shows organized European and US options

### 2. Regional Address Testing
**Objective**: Test that regions/provinces update based on selected country

**Test Case A - Germany**:
1. Select "Germany (DE)" from country dropdown
2. Verify "State" field changes to "Region" label
3. Check that region dropdown shows:
   - Bavaria
   - North Rhine-Westphalia
   - Baden-Württemberg

**Test Case B - France**:
1. Select "France (FR)" from country dropdown
2. Verify region dropdown shows:
   - Île-de-France
   - Provence-Alpes-Côte d'Azur
   - Auvergne-Rhône-Alpes

**Test Case C - United Kingdom**:
1. Select "United Kingdom (GB)" from country dropdown
2. Verify region dropdown shows:
   - England
   - Scotland
   - Wales

**Expected Result**: ✅ Region dropdown updates based on selected country

### 3. European Postal Code Testing
**Objective**: Verify postal code validation and placeholders work correctly

**Test Case A - German Postal Code**:
1. Select Germany (DE)
2. Verify postal code field shows:
   - Label: "Postal Code"
   - Placeholder: "12345"
   - Pattern: 5 digits

**Test Case B - French Postal Code**:
1. Select France (FR)
2. Verify postal code field shows:
   - Placeholder: "75001"
   - Pattern: 5 digits

**Test Case C - UK Postcode**:
1. Select United Kingdom (GB)
2. Verify postal code field shows:
   - Label: "Postcode" (instead of "Postal Code")
   - Placeholder: "SW1A 1AA"
   - Pattern: Accepts alphanumeric with space

**Test Case D - Validation Testing**:
1. Try entering invalid postal codes
2. Verify appropriate error messages appear
3. Test that valid codes are accepted

**Expected Result**: ✅ Country-specific postal code validation works

### 4. European Shipping Rate Calculations
**Objective**: Verify European shipping rates are applied correctly

**Test Case A - Below Free Shipping Threshold**:
1. Add products worth less than €75 to cart
2. Select a European country (e.g., Germany)
3. Complete shipping address
4. Verify shipping cost shows: €12.99

**Test Case B - Above Free Shipping Threshold**:
1. Add products worth more than €75 to cart
2. Select a European country
3. Verify shipping cost shows: "FREE"

**Test Case C - US Shipping Comparison**:
1. Select United States
2. Add products worth $40 (below US free threshold of $50)
3. Verify shipping cost shows: $5.99
4. Add more products to exceed $50
5. Verify shipping shows: "FREE"

**Expected Result**: ✅ Correct shipping rates for European vs US addresses

### 5. European VAT Tax Calculations
**Objective**: Verify European VAT rates are applied correctly

**Test Case A - Germany (19% VAT)**:
1. Add products worth €50 to cart
2. Select Germany as shipping address
3. Verify tax calculation: €50 × 19% = €9.50
4. Total should include the VAT amount

**Test Case B - France (20% VAT)**:
1. Add products worth €50 to cart
2. Select France as shipping address
3. Verify tax calculation: €50 × 20% = €10.00

**Test Case C - Sweden (25% VAT)**:
1. Add products worth €50 to cart
2. Select Sweden as shipping address
3. Verify tax calculation: €50 × 25% = €12.50

**Test Case D - US Sales Tax Comparison**:
1. Select United States
2. Add products worth $50
3. Verify tax calculation: $50 × 8% = $4.00

**Expected Result**: ✅ Country-specific tax rates applied correctly

### 6. Delivery Date Estimation
**Objective**: Verify delivery estimates account for European shipping

**Test Case A - European Delivery**:
1. Select a European country
2. Verify estimated delivery shows 3 days from now

**Test Case B - US Delivery**:
1. Select United States
2. Verify estimated delivery shows 5 days from now

**Expected Result**: ✅ Faster delivery estimates for European addresses

### 7. Form Validation Testing
**Objective**: Ensure all validation rules work for European addresses

**Test Case A - Required Fields**:
1. Try to submit form with empty required fields
2. Verify appropriate error messages appear

**Test Case B - Postal Code Validation**:
1. Enter invalid postal codes for selected country
2. Verify validation errors prevent submission

**Test Case C - Successful Submission**:
1. Complete form with valid German address:
   - First Name: "Hans"
   - Last Name: "Mueller"
   - Address: "Musterstraße 123"
   - City: "Berlin"
   - Region: "Berlin"
   - Postal Code: "10115"
   - Country: "Germany"

**Expected Result**: ✅ Form validation works correctly for European addresses

### 8. Currency Display Testing
**Objective**: Verify correct currency symbols are displayed

**Test Case A - EUR Countries**:
1. Select Germany, France, Spain, etc.
2. Verify all amounts show € symbol

**Test Case B - GBP (UK)**:
1. Select United Kingdom
2. Verify amounts show £ symbol

**Test Case C - CHF (Switzerland)**:
1. Select Switzerland
2. Verify amounts show CHF symbol

**Test Case D - USD (US)**:
1. Select United States
2. Verify amounts show $ symbol

**Expected Result**: ✅ Correct currency symbols for each country

## Test Data Examples

### German Address Example
```
First Name: Hans
Last Name: Mueller
Address: Musterstraße 123
City: Berlin
Region: Berlin
Postal Code: 10115
Country: Germany
```

### French Address Example
```
First Name: Marie
Last Name: Dubois
Address: 123 Rue de la Paix
City: Paris
Region: Île-de-France
Postal Code: 75001
Country: France
```

### UK Address Example
```
First Name: John
Last Name: Smith
Address: 123 High Street
City: London
Region: England
Postal Code: SW1A 1AA
Country: United Kingdom
```

## Test Results Recording

As you test each scenario, record the results:

### ✅ Passed Tests
- [ ] European country selection
- [ ] Regional address updates
- [ ] Postal code validation
- [ ] European shipping rates
- [ ] VAT tax calculations
- [ ] Delivery date estimates
- [ ] Form validation
- [ ] Currency display

### ❌ Failed Tests
- [ ] (List any issues found)

### 🔍 Issues Found
1. **Issue**: [Describe issue]
   - **Steps to reproduce**: [How to reproduce]
   - **Expected vs Actual**: [What should happen vs what happens]
   - **Priority**: High/Medium/Low

## Troubleshooting

### Common Issues

**Issue**: European countries not showing in dropdown
- **Solution**: Check browser console for JavaScript errors
- **Check**: Ensure `ShippingForm.tsx` has the `EUROPEAN_COUNTRIES` array

**Issue**: Postal code validation too strict
- **Solution**: Adjust validation regex in `calculationService.ts`
- **Check**: European postal code patterns in `validateShippingAddress`

**Issue**: Wrong shipping rates applied
- **Solution**: Verify `calculateShipping` method logic
- **Check**: European shipping constants in `calculationService.ts`

**Issue**: VAT calculation incorrect
- **Solution**: Check `EUROPEAN_VAT_RATES` mapping
- **Verify**: Tax calculation in `calculateTax` method

## Success Criteria

The European shipping functionality is working correctly when:
1. ✅ All European countries are selectable
2. ✅ Regional dropdowns update based on country
3. ✅ Postal code validation works for each country
4. ✅ European shipping rates (€12.99) are applied
5. ✅ European VAT rates are calculated correctly
6. ✅ Delivery estimates reflect faster European shipping
7. ✅ Form validation accepts valid European addresses
8. ✅ Currency symbols match selected countries

---

## Testing Checklist Summary

Before completing testing, verify:
- [ ] Server is running at http://localhost:5173
- [ ] Products can be added to cart
- [ ] Checkout process is accessible
- [ ] All test scenarios pass
- [ ] No JavaScript errors in browser console
- [ ] European addresses can complete checkout flow
- [ ] Payment processing works with European addresses

Once all tests pass, your European shipping functionality is ready for production! 🚀