/**
 * Type definitions for COREG PATH
 */
export const content = `
function $AddDaysToDateTime(value: string): string
function $AddHoursToDateTime(value: string): string
function $AddMinutesToDateTime(value: string): string
function $AdvancedFilterFileName(value: string): string
function $AdvancedFilteringFileNameForCurrentOffer(value: string): string
function $Base32Decode(value: string): string
function $Base32DecodeToLong(value: string): string
function $Base32Encode(value: string): string
function $Base32EncodeFromLong(value: string): string
function $Base64Encode(value: string): string
function $BrandKeyValue(value: string): string
function $BrowserCapability(value: string): string
function $BrowserDeviceType(value: string): string
function $BrowserIsMobile(value: string): boolean
function $BrowserMobileDeviceManufacturer(value: string): string
function $BrowserMobileDeviceModel(value: string): string
function $BrowserName(value: string): string
function $BrowserPlatform(value: string): string
function $BrowserPlatformVersion(value: string): string
function $BrowserScreenColorDepth(value: string): string
function $BrowserScreenHeight(value: string): string
function $BrowserScreenWidth(value: string): string
function $BrowserVersion(value: string): string
function $BucketValueExists(value: string): string
function $CampaignKeyValue(value: string): string
function $CampaignSyndicationId(value: string): string
function $CInt(value: string): string
function $ComputeSHA1(value: string): string
function $Concatenate(value: string): string
function $Concatenate24(value: string): string
function $Convertbrand(value: string): string
function $CoregPartnerIdFromSessionToken(value: string): string
function $CoRegPartnerKeyValue(value: string): string
function $CShort(value: string): string
function $CurrentCampaignInGroup(value: string): string
function $CurrentDateTime(value: string): string
function $CurrentHostedOfferId(value: string): string
function $CurrentLanguageChosen(value: string): string
function $CurrentOfferInGroup(value: string): string
function $CurrentPageOfferId(value: string): string
function $CurrentPathstyleInGroup(value: string): string
function $CurrentPublisherInGroup(value: string): string
function $DailyCapCount(value: string): string
function $DateConverter(value: string): string
function $DateTimeToString(value: string): string
function $DecodeFromHex(value: string): string
function $DemarcationPageNumber(value: string): string
function $DomainKeyValue(value: string): string
function $DomainPathKeyValue(value: string): string
function $EmailVerificationExists(value: string): string
function $EmailVerificationIsValid(value: string): boolean
function $EncodeCampaignSyndicationId(value: string): string
function $EncodedCampaignSyndicationId(value: string): string
function $EncodeToHex(value: string): string
function $Encrypt(value: string): string
function $EpochTimeInSeconds(value: string): string
function $FilterByAdvancedFilter(value: string): string
function $FilteredByAdvancedFiltering(value: string): string
function $FirstNonWhitespace(value: string): string
function $FormValue(value: string): string
function $GetCampaignCpaRevPerReg(value: string): string
function $GetCampaignRegistrationCount(value: string): string
function $GetChosenLotteryNumber(value: string): string
function $GetChosenLotteryNumbers(value: string): string
function $GetCurrentCpaWallNumber(value: string): string
function $GetCurrentDateTime(value: string): string
function $GetGenericPin(value: string): string
function $GetHtmlContentTemplateHtmlById(value: string): string
function $GetHtmlContentTemplateHtmlByName(value: string): string
function $GetLotteryNumberIndex(value: string): number
function $GetOfferIdFromOfferSetTemplateName(value: string): string
function $GetPathDecryptedId(value: string): string
function $GetPathEncryptedId(value: string): string
function $GetPhoneNumberCarrierId(value: string): string
function $GetPhoneNumberCarrierName(value: string): string
function $GetRegistrantPostalCode(value: string): string
function $GetRegistrationToken(value: string): string
function $GetSessionDimensionValue(value: string): string
function $GetSpawnDirective(value: string): string
function $GetValueFromDataStore(value: string): string
function $GiftRulesUrl(value: string): string
function $HexIp(value: string): string
function $HtmlEncode(value: string): string
function $IFF(expression: boolean, expected: boolean, trueCase: Function, falseCase: Function): boolean
function $ImageServerWithPrefix(value: string): string
function $In<T>(field: T, value: T, hasValue: boolean): boolean
function $IpAddress(value: string): string
function $IpAddressToCity(value: string): string
function $IpAddressToGPS(value: string): string
function $IpAddressToProvinceAbbreviation(value: string): string
function $IpAddressToProvinceFullName(value: string): string
function $IpAddressToState(value: string): string
function $IpAddressToStateAbbreviation(value: string): string
function $IpAddressToStateFullName(value: string): string
function $IpAddressToZipcode(value: string): string
function $IsCappedOfferAdvertiser(value: string): boolean
function $IsCurrentHourBetween(value: string): boolean
function $IsCurrentTimeBetween(value: string): boolean
function $IsNull(value: string): boolean
function $IsNullOrWhiteSpace(value: string): string
function $IsRegistrantMobileOptedOut(value: string): string
function $IsSecureConnection(value: string): string
function $IsValidMobilePhoneNumber(value: string): string
function $J(value: string): string
function $KeyValueCollection(value: string): string
function $Left(value: string): string
function $Length(value: string): string
function $LinkOutUrl(value: string): string
function $Mid(value: string): string
function $NonNullString(value: string): string
function $NumberOfRegistrationsSubmitted(value: string): string
function $OfferAdvertiserAcceptedInSpecifiedCollectionsWithDuration(value: string): string
function $OfferAdvertiserGroupHasBeenQualified(value: string): string
function $OfferAdvertiserHasBeenQualified(value: string): string
function $OfferCompletedActionCountByCampaignGroupAndOfferGroupWithDayDuration(value: string): string
function $OfferFormValue(value: string): string
function $OfferGroupActionPerformed(value: string): string
function $OfferGroupHasBeenActionedThisSession(value: string): string
function $OfferGroupHasBeenActionedWithDuration(value: string): string
function $OfferGroupHasBeenClickedThisSession(value: string): string
function $OfferGroupHasBeenShown(value: string): string
function $OfferGroupHasBeenTakenInSpecifiedCollectionsWithDuration(value: string): string
function $OfferHasBeenActionedThisSession(value: string): string
function $OfferHasBeenActionedWithDuration(value: string): string
function $OfferHasBeenClickedThisSession(value: string): string
function $OfferHasBeenShownThisPath(value: string): string
function $OfferHasBeenTakenInSpecifiedCollectionsWithDuration(value: string): string
function $OfferHasBeenTakenThisSession(value: string): string
function $OfferImpressionDurationSecondsByCurrentOffer(value: string): string
function $OfferImpressionDurationSecondsByOffer(value: string): string
function $OfferKeyValue(value: string): string
function $OfferKeyValueWithDefault(value: string): string
function $OfferQualifiedCount(value: string): string
function $OffersShownThisPathCount(value: string): string
function $OffersTakenThisSessionCount(value: string): string
function $OfferTakenByThisMobilePhone(value: string): string
function $OfferTakenByThisMobilePhoneWithDayDuration(value: string): string
function $PageToken(value: string): string
function $PathLocationHasBeenActionedThisSession(value: string): string
function $PathProgressPercentage(value: string): string
function $PathProgressPercentageCustom(value: string): string
function $PathStyleKeyValue(value: string): string
function $PercentageBySurveyQuestionAnswerId(value: string): string
function $PostbackUrl(value: string): string
function $PostUrlRevenueEventId(value: string): string
function $PrivacyTemplateUrl(value: string): string
function $PromotionIdFromSessionToken(value: string): string
function $PromotionKeyValue(value: string): string
function $PublisherClickId(value: string): string
function $QueryStringGetOfferSetName(value: string): string
function $QueryStringKeyValueCollection(value: string): string
function $RedirectUrl(value: string): string
function $RegexConverter(value: string): string
function $RegexReplace(value: string): string
function $RegistrantKeyValue(value: string): string
function $RegistrantLastVisitDaysAgo(value: string): string
function $RegistrantMobileOptedOutDate(value: string): string
function $RegistrantVisitedBefore(value: string): string
function $RegistrationOfferActioned(value: string): string
function $RegistrationOfferActionedWithDayDuration(value: string): string
function $RegistrationOfferAdvertiserGroupTakenByThisEmail(value: string): string
function $RegistrationOfferAdvertiserTakenByThisEmail(value: string): string
function $RegistrationOfferAdvertiserTakenByThisEmailWithDayDuration(value: string): string
function $RegistrationOfferAdvertiserTakenByThisHomePhone(value: string): string
function $RegistrationOfferAdvertiserTakenByThisHomePhoneWithDayDuration(value: string): string
function $RegistrationOfferAdvertiserTakenByThisMobilePhone(value: string): string
function $RegistrationOfferAdvertiserTakenByThisMobilePhoneWithDayDuration(value: string): string
function $RegistrationOfferTakenByThisEmail(value: string): string
function $RegistrationOfferTakenByThisEmailWithDayDuration(value: string): string
function $RegistrationOfferTakenByThisHomePhone(value: string): string
function $RegistrationOfferTakenByThisHomePhoneWithDayDuration(value: string): string
function $RegistrationOfferTakenByThisMobilePhone(value: string): string
function $RegistrationOfferTakenByThisMobilePhoneWithDayDuration(value: string): string
function $RegularExpressionMatch(value: string): string
function $Replace(value: string): string
function $Right(value: string): string
function $ScriptExecuteNonQueryById(value: string): string
function $ScriptExecuteNonQueryByName(value: string): string
function $ScriptExecuteScalarById(value: string): string
function $ScriptExecuteScalarByName(value: string): string
function $SecureImageServer(value: string): string
function $SessionIdAsHexString(value: string): string
function $SessionPromocode(value: string): string
function $SessionRandomNumber1000(value: string): string
function $SessionWasScrubbed(value: string): string
function $SetChosenLotteryNumber(value: string): string
function $SetKeyValue(value: string): string
function $SetPageToken(value: string): string
function $SourceSystemId(value: string): string
function $SpecifiedOfferInGroup(value: string): string
function $SubCampaignKeyValue(value: string): string
function $SubString(value: string): string
function $SupportDefaultOfferSet(value: string): string
function $SurveyQuestionAnswer(value: string): string
function $SurveyQuestionAnswerGetPercentage(value: string): string
function $SurveyQuestionExists(value: string): string
function $SurveyQuestionListPercentageJson(value: string): string
function $Switch(value: string): string
function $TermsAndConditionsUrl(value: string): string
function $TokenReplace(value: string): string
function $ToLower(value: string): string
function $ToString(value: string): string
function $ToUpper(value: string): string
function $TrackId(value: string): string
function $TransformValue(value: string): string
function $U(value: string): string
function $UnsubscribeUrl(value: string): string
function $UrlEncode(value: string): string
function $UserAgent(value: string): string
function $ValidEmail(value: string): string
function $WasRegistrationPrepoppedByQueryString(value: string): string
function $WeightedRandomResponseFromList(value: string): string

const $CampaignWithDetail: {
  readonly Active: boolean
  readonly AnalyticsHtml: string
  readonly BackgroundUrl: string
  readonly BonusBgImageUrl: string
  readonly BonusImageUrl: string
  readonly BonusPageFooter: string
  readonly BonusPageHeader: string
  readonly BonusPageOfferSetTemplateName: string
  readonly BonusPopPageFooter: string
  readonly BonusPopPageHeader: string
  readonly BrandAddress2: string
  readonly BrandAddress: string
  readonly BrandCity: string
  readonly BrandEmail: string
  readonly BrandFax: string
  readonly BrandName: string
  readonly BrandPhone: string
  readonly BrandPostalCode: string
  readonly BrandState: string
  readonly ClaimBonusGiftsImageUrl: string
  readonly ClickAfterClaimBonusImageUrl: string
  readonly ConsumerPromotionName: string
  readonly ContactTemplateHtml: string
  readonly CoRegPartnerCountry: string
  readonly CoRegPartnerEmail: string
  readonly CoRegPartnerPhone: string
  readonly CountOfferListOffers: string
  readonly CountPromotionPopUnder: string
  readonly CpaWallCompletedMoveOnImageUrl: string
  readonly CpaWallFooter: string
  readonly CpaWallHeader: string
  readonly CpaWallOfferBottomImageUrl: string
  readonly CpaWallOfferTopImageUrl: string
  readonly CrossCpaWallFooter: string
  readonly CrossCpaWallHeader: string
  readonly CrossSellEndButtonImageUrl: string
  readonly DefaultGiftId: string
  readonly Description: string
  readonly DnsName: string
  readonly DomainContactPagePhoneNumber: string
  readonly DomainId: string
  readonly DynamicYesNo: string
  readonly EmailFromLine: string
  readonly EmailSubjectLine: string
  readonly EndDate: string
  readonly ExitPageOfferSetTemplateName: string
  readonly Expense: string
  readonly ExpenseActionScrub: string
  readonly FooterTermsTemplateHtml: string
  readonly GiftRulesTemplateHtml: string
  readonly Id: string
  readonly ImageServer: string
  readonly ImageServerSupportsWildcardPrefix: string
  readonly ListManage: string
  readonly MobileOfferSeriesTemplateId: string
  readonly MobileOfferSeriesTemplateName: string
  readonly NetworkSyndicationId: string
  readonly NewsLetterName: string
  readonly OfferSeriesOfferSetTemplateSelectorId: string
  readonly OfferSeriesTemplateId: string
  readonly OfferSeriesTemplateName: string
  readonly PathCompleteImageUrl: string
  readonly PathContentWidth: string
  readonly PathGiftImage2Url: string
  readonly PathGiftImageUrl: string
  readonly PathInterestedImageUrl: string
  readonly PathLastStepImageUrl: string
  readonly PathNextButtonUrl: string
  readonly PathPreviousButtonUrl: string
  readonly PathSkipButtonUrl: string
  readonly PathStep1ImageUrl: string
  readonly PathStep2ImageUrl: string
  readonly PathStyle: string
  readonly PathStyleCpaWallCell: string
  readonly PathStyleCpaWallInterstitialContentTemplateName: string
  readonly PathStyleCss: string
  readonly PathStyleDescription: string
  readonly PathStyleId: string
  readonly PathStyleName: string
  readonly PathSubmitButtonUrl: string
  readonly PopCpaWallOnRegSubmit: string
  readonly PopOnRegSubmit: string
  readonly PopOnSplashSubmit: string
  readonly PopunderTemplateId: string
  readonly PopunderTemplateName: string
  readonly PrecheckPrivacyPolicy: string
  readonly PrepopulateEmail: string
  readonly PrepopulateRegistrationPageCondition: string
  readonly PrivacyTemplateHtml: string
  readonly PromotionDescription: string
  readonly PromotionId: string
  readonly PromotionName: string
  readonly PublisherId: string
  readonly RedirectingHtml: string
  readonly RegistrationFormButtonUrl: string
  readonly RegistrationPageCss: string
  readonly RegistrationPageEmailSetting: string
  readonly RegistrationPageFooter: string
  readonly RegistrationPageHeader: string
  readonly RegistrationPageHtml: string
  readonly RegistrationPageShowMobileNumber: string
  readonly RegistrationPageUseAjaxZipcode: string
  readonly RegistrationQuestions: string
  readonly RegistrationQuestionsOptOut: string
  readonly RegistrationQuestionTemplateId: string
  readonly RegistrationQuestionTemplateName: string
  readonly RequireEmail: string
  readonly RevSharePercentage: string
  readonly SecondOfferSeriesTemplateId: string
  readonly SecureImageServer: string
  readonly SendToInternalListManagersOnly: string
  readonly ShowEmailPhoneOnContactPage: string
  readonly SplashPageCss: string
  readonly SplashPageFooter: string
  readonly SplashPageFullHtml: string
  readonly SplashPageHeader: string
  readonly SplashPageHtml: string
  readonly StartDate: string
  readonly SubCampaignEndDate: string
  readonly SubCampaignId: string
  readonly SubCampaignStartDate: string
  readonly SupportUrl: string
  readonly SurveyPageOfferSetTemplateSelectorId: string
  readonly SurveyPageTemplateId: string
  readonly SurveyPageTemplateName: string
  readonly SweepstakesId: string
  readonly TermsAndConditionsTemplateHtml: string
  readonly ThankYouBgImageUrl: string
  readonly ThankYouHtml: string
  readonly ThirdPartyId: string
  readonly TicketDepartmentId: string
  readonly TopUrl: string
  readonly TotalCpaWallPageOfferReq: string
  readonly TrackingEventType: string
  readonly TrackingUrl: string
  readonly TrafficTypeId: string
  readonly UnsubscribeImageUrl: string
  readonly UnsubscribeUrl: string
  readonly UpSellGiftId: string
  readonly UpSellOfferReq: string
  readonly UpsellTemplateId: string
  readonly UpsellTemplateName: string
  readonly UseDomainPhoneNumberOnContactPage: string
  readonly UsePromotionPopunder: string
  readonly UseRetargetingPixels: string
  readonly UseSplashPageOnBeforeUnloadMessage: string
  readonly ValidatePostalCode: string
  readonly VerifyUserLeavingPage: string
  readonly VerifyUserLeavingPageMessage: string
  readonly XmlPathName: string
}
const $RegistrationCampaignGift: {
  readonly GiftId: string
  readonly ConsumerGiftName: string
}
const $Registration: {
  readonly Address: string
  readonly Address2: string
  readonly AgeInYears: string
  readonly AreaCode: string
  readonly CellArea: string
  readonly CellInternationalPhone: string
  readonly CellPhone: string
  readonly CellPhoneId: string
  readonly CellPhoneString: string
  readonly CellPrefix: string
  readonly CellSuffix: string
  readonly City: string
  readonly Country: string
  readonly CountryIso: string
  readonly CreateDate: string
  readonly DateOfBirth: string
  readonly DateOfBirthString: string
  readonly DobDay: string
  readonly DobMonth: string
  readonly DobYear: string
  readonly EmailAddress: string
  readonly EmailAddressDomain: string
  readonly EmailAddressId: string
  readonly FacebookId: string
  readonly FirstName: string
  readonly GenderIsMale: string
  readonly GenderString: string
  readonly HomeInternationalPhone: string
  readonly HomePhone: string
  readonly HomePhoneId: string
  readonly HomePhoneIsDnc: boolean
  readonly HomePhoneString: string
  readonly Id: string
  readonly IpAddress: string
  readonly LastName: string
  readonly Phone: string
  readonly PostalCode: string
  readonly Prefix: string
  readonly Province: string
  readonly ProvinceAbbreviation: string
  readonly ProvinceFullName: string
  readonly ProvinceId: string
  readonly State: string
  readonly Suffix: string
  readonly Title: string
}
const $PathNavigator: {
  readonly CpaWallIndex: string
  readonly Id: string
  readonly IsQuarantined: boolean
  readonly Meme: string
  readonly PostUrlPostRequestId: string
  readonly SessionId: string
  readonly SessionToken: string
  readonly SessionTokenRaw: string
  readonly SiloId: string
  readonly SlotNumber: string
}
`

export const pathExtraLib = {
  content,
  filePath: "ts:filename/pathTypeLib.d.ts",
}
