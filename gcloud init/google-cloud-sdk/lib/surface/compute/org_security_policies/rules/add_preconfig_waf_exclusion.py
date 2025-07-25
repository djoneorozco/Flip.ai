# -*- coding: utf-8 -*- #
# Copyright 2025 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Command for adding exclusions for preconfigured WAF rule evaluation to organization security policy rules."""

from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals

from apitools.base.py import encoding
from googlecloudsdk.api_lib.compute import base_classes
from googlecloudsdk.api_lib.compute import org_security_policy_rule_utils as rule_utils
from googlecloudsdk.api_lib.compute.org_security_policies import client
from googlecloudsdk.calliope import base
from googlecloudsdk.calliope import exceptions
from googlecloudsdk.command_lib.compute.org_security_policies import flags
from googlecloudsdk.command_lib.compute.org_security_policies import org_security_policies_utils
from googlecloudsdk.command_lib.compute.security_policies.rules import flags as rule_flags
import six


class AddPreconfigWafExclusionHelper(object):
  r"""Add an exclusion configuration for preconfigured WAF evaluation into a security policy rule.

  *{command}* is used to add an exclusion configuration for preconfigured WAF
  evaluation into a security policy rule.

  Note that request field exclusions are associated with a target, which can be
  a single rule set, or a rule set plus a list of rule IDs under the rule set.

  ## EXAMPLES

  To add specific request field exclusions that are associated with the target
  of 'sqli-stable': ['owasp-crs-v030001-id942110-sqli',
  'owasp-crs-v030001-id942120-sqli'], run:

    $ {command} 1000 \
       --security-policy=1234567890 \
       --target-rule-set=sqli-stable \
       --target-rule-ids='owasp-crs-v030001-id942110-sqli','owasp-crs-v030001-id942120-sqli'
       \
       --request-header-to-exclude='op=EQUALS,val=abc' \
       --request-header-to-exclude='op=STARTS_WITH,val=xyz' \
       --request-uri-to-exclude='op=EQUALS_ANY'

  To add specific request field exclusions that are associated with the target
  of 'sqli-stable': [], run:

    $ {command} 1000 \
       --security-policy=1234567890 \
       --target-rule-set=sqli-stable \
       --request-cookie-to-exclude='op=EQUALS_ANY'
  """

  @classmethod
  def Args(cls, parser):
    """Generates the flagset for an AddPreconfigWafExclusion command."""
    flags.AddOrganization(parser, required=False)
    cls.ORG_SECURITY_POLICY_ARG = flags.OrgSecurityPolicyRuleArgument(
        required=True, operation='add preconfig WAF exclusion'
    )
    cls.ORG_SECURITY_POLICY_ARG.AddArgument(parser)
    flags.AddSecurityPolicyId(parser, operation='updated')
    rule_flags.AddTargetRuleSet(parser=parser, is_add=True)
    rule_flags.AddTargetRuleIds(parser=parser, is_add=True)
    rule_flags.AddRequestHeader(parser=parser, is_add=True)
    rule_flags.AddRequestCookie(parser=parser, is_add=True)
    rule_flags.AddRequestQueryParam(parser=parser, is_add=True)
    rule_flags.AddRequestUri(parser=parser, is_add=True)

  @classmethod
  def _IsIdenticalTarget(cls,
                         existing_exclusion,
                         target_rule_set,
                         target_rule_ids=None):
    return target_rule_set == existing_exclusion.targetRuleSet and set(
        target_rule_ids) == set(existing_exclusion.targetRuleIds)

  @classmethod
  def _ConvertRequestFieldToAdd(cls, compute_client, request_field_to_add):
    """Converts RequestFieldToAdd."""
    request_field = (
        compute_client.messages
        .SecurityPolicyRulePreconfiguredWafConfigExclusionFieldParams())

    op = request_field_to_add.get('op') or ''
    if op:
      request_field.op = (
          compute_client.messages
          .SecurityPolicyRulePreconfiguredWafConfigExclusionFieldParams
          .OpValueValuesEnum(op))

    val = request_field_to_add.get('val') or ''
    if val:
      request_field.val = val

    return request_field

  @classmethod
  def _AddRequestField(cls, compute_client, existing_request_fields,
                       request_field_to_add):
    """Adds Request Field."""
    new_request_field = cls._ConvertRequestFieldToAdd(compute_client,
                                                      request_field_to_add)
    for existing_request_field in existing_request_fields:
      if existing_request_field == new_request_field:
        return
    existing_request_fields.append(new_request_field)

  @classmethod
  def _UpdateExclusion(cls,
                       compute_client,
                       existing_exclusion,
                       request_headers=None,
                       request_cookies=None,
                       request_query_params=None,
                       request_uris=None):
    """Updates Exclusion."""
    for request_header in request_headers or []:
      cls._AddRequestField(compute_client,
                           existing_exclusion.requestHeadersToExclude,
                           request_header)
    for request_cookie in request_cookies or []:
      cls._AddRequestField(compute_client,
                           existing_exclusion.requestCookiesToExclude,
                           request_cookie)
    for request_query_param in request_query_params or []:
      cls._AddRequestField(compute_client,
                           existing_exclusion.requestQueryParamsToExclude,
                           request_query_param)
    for request_uri in request_uris or []:
      cls._AddRequestField(compute_client,
                           existing_exclusion.requestUrisToExclude, request_uri)

  @classmethod
  def _CreateExclusion(cls,
                       compute_client,
                       target_rule_set,
                       target_rule_ids=None,
                       request_headers=None,
                       request_cookies=None,
                       request_query_params=None,
                       request_uris=None):
    """Creates Exclusion."""
    new_exclusion = (
        compute_client.messages
        .SecurityPolicyRulePreconfiguredWafConfigExclusion())
    new_exclusion.targetRuleSet = target_rule_set
    for target_rule_id in target_rule_ids or []:
      new_exclusion.targetRuleIds.append(target_rule_id)
    cls._UpdateExclusion(compute_client, new_exclusion, request_headers,
                         request_cookies, request_query_params, request_uris)
    return new_exclusion

  @classmethod
  def _UpdatePreconfigWafConfig(cls, compute_client, existing_rule, args):
    """Updates Preconfig WafConfig."""
    if existing_rule.preconfiguredWafConfig:
      new_preconfig_waf_config = encoding.CopyProtoMessage(
          existing_rule.preconfiguredWafConfig)
    else:
      new_preconfig_waf_config = (
          compute_client.messages.SecurityPolicyRulePreconfiguredWafConfig())

    for exclusion in new_preconfig_waf_config.exclusions:
      if cls._IsIdenticalTarget(exclusion, args.target_rule_set,
                                args.target_rule_ids or []):
        cls._UpdateExclusion(compute_client, exclusion,
                             args.request_header_to_exclude,
                             args.request_cookie_to_exclude,
                             args.request_query_param_to_exclude,
                             args.request_uri_to_exclude)
        return new_preconfig_waf_config

    new_exclusion = cls._CreateExclusion(compute_client, args.target_rule_set,
                                         args.target_rule_ids,
                                         args.request_header_to_exclude,
                                         args.request_cookie_to_exclude,
                                         args.request_query_param_to_exclude,
                                         args.request_uri_to_exclude)
    new_preconfig_waf_config.exclusions.append(new_exclusion)
    return new_preconfig_waf_config

  @classmethod
  def Run(cls, release_track, args):
    """Validates arguments and patches a security policy rule."""
    if not (args.IsSpecified('request_header_to_exclude') or
            args.IsSpecified('request_cookie_to_exclude') or
            args.IsSpecified('request_query_param_to_exclude') or
            args.IsSpecified('request_uri_to_exclude')):
      request_field_names = [
          '--request-header-to-exclude', '--request-cookie-to-exclude',
          '--request-query-param-to-exclude', '--request-uri-to-exclude'
      ]
      raise exceptions.MinimumArgumentException(
          request_field_names, 'At least one request field must be specified.')

    for request_fields in [
        args.request_header_to_exclude or [], args.request_cookie_to_exclude or
        [], args.request_query_param_to_exclude or [],
        args.request_uri_to_exclude or []
    ]:
      for request_field in request_fields:
        op = request_field.get('op') or ''
        if not op or op not in [
            'EQUALS', 'STARTS_WITH', 'ENDS_WITH', 'CONTAINS', 'EQUALS_ANY'
        ]:
          raise exceptions.InvalidArgumentException(
              'op',
              'A request field operator must be one of [EQUALS, STARTS_WITH, '
              'ENDS_WITH, CONTAINS, EQUALS_ANY].')

    holder = base_classes.ComputeApiHolder(release_track)
    compute_client = holder.client
    ref = cls.ORG_SECURITY_POLICY_ARG.ResolveAsResource(
        args, holder.resources, with_project=False
    )
    priority = rule_utils.ConvertPriorityToInt(ref.Name())
    security_policy_rule_client = client.OrgSecurityPolicyRule(
        ref=ref,
        compute_client=compute_client,
        resources=holder.resources,
        version=six.text_type(release_track).lower(),
    )
    security_policy_id = org_security_policies_utils.GetSecurityPolicyId(
        security_policy_rule_client,
        args.security_policy,
        organization=args.organization,
    )

    existing_rule = security_policy_rule_client.Describe(
        priority=priority,
        security_policy_id=security_policy_id,
        batch_mode=True,
    )[0]

    new_preconfig_waf_config = cls._UpdatePreconfigWafConfig(
        compute_client, existing_rule, args)
    security_policy_rule = holder.client.messages.SecurityPolicyRule(
        preconfiguredWafConfig=new_preconfig_waf_config
    )

    return security_policy_rule_client.Update(
        priority=priority,
        security_policy=security_policy_id,
        security_policy_rule=security_policy_rule,
        batch_mode=True,
    )


@base.UniverseCompatible
@base.ReleaseTracks(base.ReleaseTrack.BETA)
class AddPreconfigWafExclusionBeta(base.UpdateCommand):
  r"""Add an exclusion configuration for preconfigured WAF evaluation into a security policy rule.

  *{command}* is used to add an exclusion configuration for preconfigured WAF
  evaluation into a security policy rule.

  Note that request field exclusions are associated with a target, which can be
  a single rule set, or a rule set plus a list of rule IDs under the rule set.

  ## EXAMPLES

  To add specific request field exclusions that are associated with the target
  of 'sqli-stable': ['owasp-crs-v030001-id942110-sqli',
  'owasp-crs-v030001-id942120-sqli'], run:

    $ {command} 1000 \
       --security-policy=1234567890 \
       --target-rule-set=sqli-stable \
       --target-rule-ids=owasp-crs-v030001-id942110-sqli,owasp-crs-v030001-id942120-sqli
       \
       --request-header-to-exclude='op=EQUALS,val=abc' \
       --request-header-to-exclude='op=STARTS_WITH,val=xyz' \
       --request-uri-to-exclude='op=EQUALS_ANY'

  To add specific request field exclusions that are associated with the target
  of 'sqli-stable': [], run:

    $ {command} 1000 \
       --security-policy=1234567890 \
       --target-rule-set=sqli-stable \
       --request-cookie-to-exclude='op=EQUALS_ANY'
  """

  ORG_SECURITY_POLICY_ARG = None
  NAME_ARG = None

  @classmethod
  def Args(cls, parser):
    AddPreconfigWafExclusionHelper.Args(
        parser,
    )

  def Run(self, args):
    return AddPreconfigWafExclusionHelper.Run(
        self.ReleaseTrack(),
        args,
    )


@base.UniverseCompatible
@base.ReleaseTracks(base.ReleaseTrack.ALPHA)
class AddPreconfigWafExclusionAlpha(AddPreconfigWafExclusionBeta):
  r"""Add an exclusion configuration for preconfigured WAF evaluation into a security policy rule.

  *{command}* is used to add an exclusion configuration for preconfigured WAF
  evaluation into a security policy rule.

  Note that request field exclusions are associated with a target, which can be
  a single rule set, or a rule set plus a list of rule IDs under the rule set.

  ## EXAMPLES

  To add specific request field exclusions that are associated with the target
  of 'sqli-stable': ['owasp-crs-v030001-id942110-sqli',
  'owasp-crs-v030001-id942120-sqli'], run:

    $ {command} 1000 \
       --security-policy=1234567890 \
       --target-rule-set=sqli-stable \
       --target-rule-ids='owasp-crs-v030001-id942110-sqli','owasp-crs-v030001-id942120-sqli'
       \
       --request-header-to-exclude='op=EQUALS,val=abc' \
       --request-header-to-exclude='op=STARTS_WITH,val=xyz' \
       --request-uri-to-exclude='op=EQUALS_ANY'

  To add specific request field exclusions that are associated with the target
  of 'sqli-stable': [], run:

    $ {command} 1000 \
       --security-policy=1234567890 \
       --target-rule-set=sqli-stable \
       --request-cookie-to-exclude='op=EQUALS_ANY'
  """
