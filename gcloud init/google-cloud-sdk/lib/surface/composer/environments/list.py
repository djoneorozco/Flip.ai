# -*- coding: utf-8 -*- #
# Copyright 2017 Google LLC. All Rights Reserved.
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
"""Command to list environments in a project and location."""

from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals

from googlecloudsdk.api_lib.composer import environments_util as environments_api_util
from googlecloudsdk.calliope import arg_parsers
from googlecloudsdk.calliope import base
from googlecloudsdk.command_lib.composer import flags
from googlecloudsdk.command_lib.composer import resource_args
from googlecloudsdk.core import resources


DETAILED_HELP = {
    'EXAMPLES':
        """\
          To list the Cloud Composer environments under the project 'project-1'
          and in location 'us-central1', run:

            $ {command} --project=project-1 --locations=us-central1
        """
}


@base.UniverseCompatible
class List(base.ListCommand):
  """List the Cloud Composer environments under a project and location.

  List environments that have not been successfully deleted. Prints a table
  with the following columns:
  * name
  * location
  * status
  * creation timestamp
  """

  detailed_help = DETAILED_HELP

  @staticmethod
  def _GetUri(environment):
    r = resources.REGISTRY.ParseRelativeName(
        environment.name,
        collection='composer.projects.locations.environments',
        api_version='v1',
    )
    return r.SelfLink()

  @staticmethod
  def Args(parser):
    resource_args.AddLocationResourceArg(
        parser,
        'in which to list environments',
        positional=False,
        required=arg_parsers.ArgRequiredInUniverse(
            default_universe=False, non_default_universe=True
        ),
        plural=True,
        help_supplement=(
            'If not specified, the location stored in the property '
            ' [composer/location] will be used.'
        ),
    )
    parser.display_info.AddFormat('table[box]('
                                  'name.segment(5):label=NAME,'
                                  'name.segment(3):label=LOCATION,'
                                  'state:label=STATE,'
                                  'createTime:reverse'
                                  ')')
    parser.display_info.AddUriFunc(List._GetUri)

  def Run(self, args):
    location_refs = flags.FallthroughToLocationProperty(
        args.CONCEPTS.locations.Parse(),
        '--locations',
        'One or more locations in which to list environments must be provided.')

    return environments_api_util.List(
        location_refs,
        args.page_size,
        limit=args.limit,
        release_track=self.ReleaseTrack())
